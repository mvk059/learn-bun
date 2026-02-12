# 2.4 Server Lifecycle

## Learning Objectives

- Create a server factory function
- Handle server startup callbacks
- Implement graceful shutdown
- Understand the full server lifecycle

---

## Why Factory Functions?

So far we have been calling `Bun.serve()` directly at the top level of our
scripts. That works for quick demos, but real applications need more control.
A **server factory function** wraps `Bun.serve()` and returns a handle you can
use to inspect and stop the server later.

Benefits of the factory pattern:

1. **Configurability** -- callers pass in options (port, callbacks) without
   touching the internal wiring.
2. **Testability** -- tests can spin up a server on port `0` (random available
   port), run assertions, and tear it down cleanly.
3. **Multiple instances** -- you can create several servers in the same process
   (e.g., an API server and an admin server on different ports).
4. **Clean shutdown** -- the factory can return a `stop()` helper that closes
   the server and releases resources in one call.

---

## The ServerOptions Pattern

Define a small type that captures everything the caller can customize:

```typescript
type ServerOptions = {
  port: number;
  onStart?: (url: string) => void;
};
```

`port` is required -- every server needs one.  Pass `0` and Bun will pick a
free port automatically, which is perfect for tests.

`onStart` is an optional callback.  The factory calls it once the server is
listening, passing the full URL string (e.g. `http://localhost:3000`).  This
is useful for logging, notifying a process manager, or signalling readiness in
a test.

---

## Server Properties

After calling `Bun.serve()` you get back a server object with useful
properties:

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello");
  },
});

server.port; // 3000 (or the actual port if you passed 0)
server.url;  // URL object: http://localhost:3000
```

`server.port` gives you the *actual* port the OS assigned, which is essential
when you pass `port: 0`.

`server.url` is a full `URL` object you can convert to a string.

---

## Graceful Shutdown with server.stop()

Servers hold open file descriptors and keep the process alive.  When you are
done -- in a test teardown, on SIGTERM, or during a hot-reload -- call
`server.stop()`:

```typescript
server.stop();        // stop accepting new connections, let idle ones drain
server.stop(true);    // also close idle connections immediately
```

Passing `true` is the fast path: it tells Bun to close connections that are
not actively sending or receiving data right now.  For tests this is almost
always what you want so the process exits quickly.

---

## Health Check Endpoints

Production servers expose a `GET /health` (or `/healthz`) endpoint so that
load balancers and orchestrators can verify the service is alive:

```typescript
if (req.method === "GET" && url.pathname === "/health") {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
```

A good health response includes:

| Field       | Purpose                                      |
|-------------|----------------------------------------------|
| `status`    | Simple "ok" / "degraded" / "error" string    |
| `timestamp` | ISO-8601 date so monitors can detect staleness|

Keep health checks **fast** and **side-effect free**.  They should not write to
a database or perform expensive computation.

---

## Clean Resource Cleanup

In later chapters our servers will hold in-memory data stores, open database
connections, and background timers.  The factory pattern makes cleanup
straightforward:

```typescript
function createServer(options) {
  // ... set up resources ...
  const server = Bun.serve({ ... });

  return {
    server,
    stop() {
      // 1. Stop the HTTP server
      server.stop(true);
      // 2. Close DB connections, clear timers, flush logs, etc.
    },
  };
}
```

By putting all cleanup behind a single `stop()` call, every consumer -- tests,
the main entry point, signal handlers -- can shut down the same way.

---

## Key APIs

```typescript
// Create a server
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("ok");
  },
});

// Inspect
server.port; // actual port number
server.url;  // full URL as a URL object

// Shut down
server.stop(true); // true = close idle connections immediately
```

---

## Your Task

1. Define a `ServerOptions` type with:
   - `port`: `number`
   - `onStart`: optional callback that receives the URL string

2. Implement `createTaskManagerServer(options: ServerOptions)` that:
   - Creates a Bun server on the given port
   - Has a `GET /health` endpoint returning `{ status: "ok", timestamp: <ISO string> }`
   - Returns `404` JSON `{ error: "Not Found" }` for all other routes
   - Calls the `onStart` callback (if provided) with the URL string after the
     server starts
   - Returns `{ server, stop }` where `stop()` calls `server.stop(true)`

### Expected behaviour

```
GET /health        -> 200 { "status": "ok", "timestamp": "2026-02-12T..." }
GET /anything-else -> 404 { "error": "Not Found" }
```

---

## Running Tests

```bash
# Test your exercise
bun test exercise.test.ts

# Test the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

---

## Key Takeaways

- Wrap `Bun.serve()` in a factory function for configurability and testability.
- Use `port: 0` in tests to avoid port conflicts.
- Expose a `stop()` function that calls `server.stop(true)` for fast cleanup.
- Health check endpoints let external systems verify your server is alive.
- Always clean up resources (connections, timers) when stopping a server.
