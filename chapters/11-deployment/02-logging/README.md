# 11.2 Structured Logging

## What You'll Learn

- Why structured (JSON) logging is preferred over plain text in production
- How to implement a logger with multiple severity levels
- Request ID generation for tracing requests across services
- Best practices for request logging middleware

## Why Structured Logging?

In development, `console.log("Server started on port 3000")` works fine. You read the
terminal output yourself and your eyes parse the text naturally. In production, things are
very different.

Production logs are consumed by machines: log aggregation services like Datadog, Splunk,
the ELK stack (Elasticsearch, Logstash, Kibana), or AWS CloudWatch. These systems need to
index, search, filter, and alert on your logs. Unstructured text makes this difficult.

**Plain text logging:**
```
[2025-01-15 10:30:00] INFO: User logged in - userId=42, ip=192.168.1.1
```

**Structured JSON logging:**
```json
{"level":"info","message":"User logged in","userId":42,"ip":"192.168.1.1","timestamp":"2025-01-15T10:30:00.000Z"}
```

The JSON version is machine-parseable. You can query for all "error" level logs, filter by
userId, or build dashboards from numeric fields without writing fragile regex patterns.

## Log Levels

Standard log levels, in order of severity:

| Level   | Use Case |
|---------|----------|
| `debug` | Detailed diagnostic info, disabled in production |
| `info`  | Normal operational events (server started, user action) |
| `warn`  | Something unexpected that isn't an error yet (slow query, retry) |
| `error` | Something failed and needs attention (unhandled exception, DB down) |

Each level serves a purpose. In production, you typically set a minimum level of `info` or
`warn` to reduce log volume while keeping useful operational data.

## Building a Logger

A production logger should:

1. Output JSON to stdout (let the infrastructure handle routing)
2. Include a timestamp on every log entry
3. Accept arbitrary metadata as key-value pairs
4. Support multiple log levels

```typescript
class Logger {
  private log(level: string, message: string, data?: Record<string, any>): void {
    const entry = JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    });
    console.log(entry);
  }

  info(message: string, data?: Record<string, any>): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: Record<string, any>): void {
    this.log("error", message, data);
  }
}
```

### Dependency Injection for Testing

Notice the constructor accepts an output function. In production, you pass `console.log`
(or let it default). In tests, you capture the output by passing a function that pushes to
an array:

```typescript
const logs: string[] = [];
const logger = new Logger((msg) => logs.push(msg));
logger.info("test");
const parsed = JSON.parse(logs[0]);
// Now you can assert on parsed.level, parsed.message, etc.
```

This pattern avoids polluting test output with log noise and makes assertions easy.

## Request IDs

When a request flows through multiple services (API gateway, auth service, user service,
database), debugging failures requires correlating logs across all those services. A
**request ID** is a unique identifier attached to every incoming request and passed along
to downstream services.

```typescript
function generateRequestId(): string {
  return crypto.randomUUID();
}
```

The `crypto.randomUUID()` function generates a v4 UUID like
`"f47ac10b-58cc-4372-a567-0e02b2c3d479"`. It is available globally in Bun without any
imports.

### Using Request IDs in Middleware

```typescript
function handleRequest(req: Request): Response {
  const requestId = req.headers.get("x-request-id") ?? generateRequestId();
  const logger = new Logger();

  logger.info("Request received", {
    requestId,
    method: req.method,
    path: new URL(req.url).pathname,
  });

  // ... handle request ...

  logger.info("Request completed", {
    requestId,
    status: 200,
    duration: elapsed,
  });

  return new Response("OK", {
    headers: { "x-request-id": requestId },
  });
}
```

By including the `requestId` in every log line, you can filter all logs for a single
request, even across multiple services.

## Request Logging Best Practices

1. **Log at the start and end of each request** with method, path, status, and duration
2. **Include request IDs** in every log entry for traceability
3. **Do not log sensitive data** such as passwords, tokens, or PII
4. **Log to stdout** and let the infrastructure handle routing to files or services
5. **Use appropriate levels**: info for normal requests, warn for slow ones, error for failures
6. **Keep log entries flat** -- avoid deeply nested objects for easier querying

## Performance Considerations

JSON serialization has a cost. For very high-throughput services:

- Avoid logging large request/response bodies
- Consider sampling (log every Nth request at debug level)
- Use `JSON.stringify` carefully -- circular references will throw
- Buffer writes if logging to files (stdout is typically buffered by the OS)

## Exercise

Implement the `Logger` class with `info`, `warn`, and `error` methods that output
structured JSON, and a `generateRequestId` function that returns unique identifiers.

## Key Takeaways

- Structured JSON logs are essential for production log aggregation and searching
- A logger should include level, message, timestamp, and arbitrary metadata
- Request IDs enable tracing a single request across multiple services and log entries
- Inject the output function for testability
- Log to stdout and let infrastructure handle routing
