# 11.1 Health Check & Graceful Shutdown

## What You'll Learn

- Why health check endpoints are essential for production deployments
- How to implement liveness and readiness probes
- Graceful shutdown with SIGTERM and SIGINT signal handling
- Draining active connections before stopping the server

## Why Health Checks Matter

In production, your application rarely runs in isolation. It sits behind a load balancer,
runs inside a container orchestrator like Kubernetes or Docker Swarm, or is managed by a
process supervisor like systemd or PM2. All of these systems need a way to know whether
your application is alive and ready to handle traffic.

Without health checks, infrastructure tools have no visibility into your app's state. They
can only check if the process is running, not whether it can actually serve requests. A
process might be alive but deadlocked, out of memory, or unable to reach its database.

### Liveness vs. Readiness

There are two common types of health check endpoints:

**Liveness probe (`/health`)**: Answers the question "Is the process alive and responsive?"
If this fails, the orchestrator should restart the container. This endpoint should be
lightweight and always respond quickly.

**Readiness probe (`/ready`)**: Answers "Can this instance handle traffic right now?" A
server might be alive but not ready if it is still warming up caches, running migrations,
or if a critical downstream dependency is unreachable. If readiness fails, the load
balancer removes the instance from rotation but does not restart it.

## Health Check Response

A good health endpoint returns structured JSON with useful diagnostic information:

```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

- **status**: A simple string indicator ("ok" or "degraded")
- **uptime**: Seconds since the process started, useful for detecting restart loops
- **timestamp**: Server's current time, helps detect clock drift

## Implementing in Bun

Bun's `Bun.serve()` makes it straightforward to add health routes:

```typescript
const startTime = Date.now();

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({
        status: "ok",
        uptime: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
      });
    }

    // ... other routes
  },
});
```

## Graceful Shutdown

When a deployment platform needs to stop your application (during a rolling update, scale-
down, or node drain), it sends a SIGTERM signal. Your application should:

1. Stop accepting new connections
2. Finish processing in-flight requests
3. Close database connections and other resources
4. Exit the process

This is called **graceful shutdown**. Without it, active requests get abruptly terminated,
leading to errors for your users.

### Signal Handling

```typescript
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.stop(true); // true = wait for in-flight requests
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  server.stop(true);
});
```

The `server.stop(true)` call in Bun tells the server to stop accepting new connections but
finish processing any requests that are currently in-flight.

### Connection Draining

In Kubernetes, the sequence during a pod shutdown is:

1. Pod is marked as "Terminating" and removed from the Service endpoints
2. SIGTERM is sent to the container
3. The container has a grace period (default 30 seconds) to finish work
4. If still running after the grace period, SIGKILL is sent

Your graceful shutdown handler should complete within the grace period. If you have long-
running requests, consider setting a timeout:

```typescript
process.on("SIGTERM", () => {
  server.stop(true);

  // Force exit after 25 seconds if connections haven't drained
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 25000);
});
```

## Wrapping It Up as a Factory

A common pattern is to wrap the server creation in a function that returns both the server
instance and a `stop` method:

```typescript
function createServer(options: { port: number }) {
  const server = Bun.serve({ port: options.port, fetch(req) { /* ... */ } });

  return {
    server,
    stop: () => server.stop(true),
  };
}
```

This pattern makes it easy to start and stop servers in tests without managing global state.

## Load Balancer Integration

Most cloud load balancers (AWS ALB, GCP Load Balancer, nginx) can be configured to poll
your health endpoint at a regular interval. A typical configuration:

- **Path**: `/health`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Healthy threshold**: 2 consecutive successes
- **Unhealthy threshold**: 3 consecutive failures

If the health endpoint fails the unhealthy threshold, the load balancer stops sending
traffic to that instance.

## Best Practices

1. Keep health endpoints fast -- avoid heavy computation or database queries in `/health`
2. Use `/ready` for dependency checks (database connectivity, cache warmth)
3. Always handle SIGTERM for graceful shutdown
4. Set a forced shutdown timeout as a safety net
5. Log when shutdown begins and completes for debugging
6. Return appropriate HTTP status codes (200 for healthy, 503 for unhealthy)

## Exercise

Implement the `createHealthyServer` function that returns a server with `/health` and
`/ready` endpoints, plus a `stop()` method for graceful shutdown.

## Key Takeaways

- Health check endpoints let infrastructure know if your app is alive and ready
- Liveness probes (`/health`) detect crashes; readiness probes (`/ready`) control traffic routing
- Graceful shutdown prevents dropped requests during deployments
- Always handle SIGTERM and SIGINT in production applications
- The factory pattern (`createServer` returning `{ server, stop }`) simplifies testing
