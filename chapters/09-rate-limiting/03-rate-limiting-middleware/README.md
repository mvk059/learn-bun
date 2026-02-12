# 9.3 Rate Limiting Middleware

## What You'll Learn

- Integrating rate limiting into an HTTP server using Bun.serve
- Setting standard rate limit response headers
- Returning proper 429 Too Many Requests responses
- Using the Retry-After header to inform clients when to retry

## Introduction

In the previous lessons, we built a token bucket and a rate limiter store.
Now it is time to integrate these components into an actual HTTP server. This
lesson covers the standard conventions for rate limiting in HTTP APIs,
including the response headers and status codes that clients expect.

## Rate Limit Headers

Well-behaved APIs communicate rate limit status through response headers on
every response, not just when limits are exceeded. The standard headers are:

| Header                    | Description                                         |
|---------------------------|-----------------------------------------------------|
| `X-RateLimit-Limit`       | The maximum number of requests allowed in the window |
| `X-RateLimit-Remaining`   | How many requests the client has left                |
| `X-RateLimit-Reset`       | Unix timestamp when the limit resets                 |

These headers let clients implement intelligent backoff and pacing without
having to guess or probe the server's limits.

### Example Response Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1706140800
Content-Type: application/json

{"message": "OK"}
```

## 429 Too Many Requests

When a client exceeds their rate limit, the server responds with HTTP status
code **429 Too Many Requests**. This is defined in RFC 6585 and is the
standard way to communicate rate limiting.

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706140800
Retry-After: 60
Content-Type: application/json

{"error": "Too Many Requests"}
```

### The Retry-After Header

The `Retry-After` header tells the client how many seconds to wait before
making another request. This is crucial for well-behaved clients and automated
systems. Without it, clients may retry immediately, creating a thundering herd
effect.

```typescript
headers: {
  "Retry-After": String(windowSeconds)
}
```

## Server Architecture

The rate-limited server follows this flow for every incoming request:

```
Request arrives
    |
    v
Extract client IP (x-forwarded-for or default)
    |
    v
Look up / create token bucket for IP
    |
    v
Attempt to consume a token
    |
    +--> Token available: 200 OK + rate limit headers
    |
    +--> No tokens left: 429 + rate limit headers + Retry-After
```

## Client IP Extraction

In production, the client's real IP may be obscured by proxies and load
balancers. The `X-Forwarded-For` header is commonly used to pass the
original client IP through proxy chains.

```typescript
const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
```

For local development and testing (where requests come from localhost), we
fall back to `"127.0.0.1"` as a sensible default.

## Implementing with Bun.serve

Bun's built-in HTTP server makes it straightforward to add rate limiting
as middleware logic directly in the `fetch` handler:

```typescript
const server = Bun.serve({
  port: options.port,
  fetch(req) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const bucket = getBucket(ip);

    // Set headers on every response
    const headers = {
      "X-RateLimit-Limit": String(maxRequests),
      "X-RateLimit-Remaining": String(bucket.getTokens()),
    };

    if (!bucket.consume()) {
      return Response.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { ...headers, "Retry-After": "60" } }
      );
    }

    return Response.json({ message: "OK" }, { headers });
  },
});
```

## Testing Rate Limiting

When testing, use `port: 0` to let the OS assign a random available port.
This prevents port conflicts when running multiple test servers:

```typescript
const result = createRateLimitedServer({ port: 0, maxRequests: 5, windowSeconds: 60 });
const baseUrl = `http://localhost:${result.server.port}`;
```

Always stop test servers in the `afterAll` hook to avoid dangling processes.

## Exercise

Implement a `createRateLimitedServer` function that:

- Accepts `{ port, maxRequests, windowSeconds }` configuration
- Creates a Bun HTTP server with rate limiting
- Tracks requests per client IP using token buckets
- Includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and
  `X-RateLimit-Reset` headers on all responses
- Returns `200 { message: "OK" }` for allowed requests
- Returns `429 { error: "Too Many Requests" }` with `Retry-After` header
  when limit is exceeded
- Returns `{ server, stop() }` for lifecycle management

### Hints

- Reuse the `TokenBucket` class from earlier lessons
- Use a `Map` to store buckets by IP address
- Calculate the refill rate as `maxRequests / windowSeconds`
- Use `Bun.serve()` with a custom `fetch` handler
- Remember to set headers on both success and error responses

## Running Tests

```bash
cd chapters/09-rate-limiting/03-rate-limiting-middleware
bun test              # Test your exercise
TEST_SOLUTION=1 bun test  # Test the solution
```
