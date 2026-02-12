# 4.4 Middleware Pattern

## What You'll Learn

- The middleware pattern for cross-cutting concerns
- Building CORS, timing, and logging middleware
- Middleware type signatures and composition
- How to wrap handlers to add behavior before and after execution

## What Is Middleware?

Middleware is a function that wraps a handler to add behavior before or after the handler
runs. It is the standard pattern for implementing cross-cutting concerns -- functionality
that applies across many routes but is not part of any single route's business logic.

Common cross-cutting concerns include:

- **CORS** - Adding cross-origin resource sharing headers
- **Timing** - Measuring and reporting response times
- **Logging** - Recording requests and responses
- **Authentication** - Verifying tokens before reaching handlers
- **Rate limiting** - Throttling excessive requests
- **Compression** - Compressing response bodies

Without middleware, you would duplicate this logic in every handler. With middleware,
you write it once and apply it wherever needed.

## The Middleware Type Signature

In its simplest form, a middleware takes a handler and returns a new handler:

```typescript
type Handler = (req: Request) => Response | Promise<Response>;
type Middleware = (handler: Handler) => Handler;
```

The returned handler wraps the original. It can:

1. Inspect or modify the request **before** calling the inner handler
2. Call the inner handler to get a response
3. Inspect or modify the response **after** the inner handler returns
4. Short-circuit by returning a response without calling the inner handler

This is sometimes called the "onion model" because each middleware wraps the next layer,
and the request passes through each layer on the way in and each layer on the way out.

```
Request --> [Logging] --> [CORS] --> [Timing] --> Handler
                                                    |
Response <-- [Logging] <-- [CORS] <-- [Timing] <----+
```

## Building a Logging Middleware

A logging middleware demonstrates the before/after pattern:

```typescript
const loggingMiddleware: Middleware = (handler) => {
  return async (req) => {
    const url = new URL(req.url);
    console.log(`--> ${req.method} ${url.pathname}`);
    const res = await handler(req);
    console.log(`<-- ${res.status} ${req.method} ${url.pathname}`);
    return res;
  };
};
```

The middleware returns a new async function that logs before calling the handler, then
logs the status after. The `await` ensures we wait for the handler to complete before
logging the response.

## Building a CORS Middleware

CORS middleware is more involved because it needs configuration (which origins to allow)
and must handle preflight OPTIONS requests specially. This makes it a middleware factory --
a function that returns a middleware:

```typescript
function corsMiddleware(allowedOrigins: string[]): Middleware {
  return (handler) => {
    return async (req) => {
      const origin = req.headers.get("Origin");
      const isAllowed = origin ? allowedOrigins.includes(origin) : false;

      // Handle preflight
      if (req.method === "OPTIONS" && isAllowed) {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin!,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      }

      const res = await handler(req);

      // Add CORS header to normal responses
      if (isAllowed) {
        const newRes = new Response(res.body, res);
        newRes.headers.set("Access-Control-Allow-Origin", origin!);
        return newRes;
      }

      return res;
    };
  };
}
```

Key points about this implementation:

- It is a **factory function** that takes configuration and returns a `Middleware`
- For preflight requests from allowed origins, it short-circuits with a 204 response
- For normal requests from allowed origins, it clones the response and adds the header
- For disallowed origins, it passes the response through unchanged

Note the `new Response(res.body, res)` pattern. This creates a new Response with the
same body and headers as the original, but the new Response has mutable headers. The
original Response from `handler(req)` may have immutable headers, so cloning is necessary.

## Building a Timing Middleware

Timing middleware measures how long the handler takes to execute:

```typescript
const timingMiddleware: Middleware = (handler) => {
  return async (req) => {
    const start = performance.now();
    const res = await handler(req);
    const duration = (performance.now() - start).toFixed(2);
    const newRes = new Response(res.body, res);
    newRes.headers.set("X-Response-Time", `${duration}ms`);
    return newRes;
  };
};
```

The `performance.now()` API provides high-resolution timestamps in milliseconds. The
`toFixed(2)` formats the result to two decimal places.

## Composing Middleware

Individual middlewares are useful, but the real power comes from composition. The
`applyMiddleware` function takes a handler and any number of middlewares, applying
them in order:

```typescript
function applyMiddleware(handler: Handler, ...middlewares: Middleware[]): Handler {
  return middlewares.reduceRight((h, middleware) => middleware(h), handler);
}
```

The `reduceRight` is important here. It processes middlewares from right to left, meaning
the first middleware in the list becomes the outermost wrapper. This matches the intuitive
reading order:

```typescript
const finalHandler = applyMiddleware(
  baseHandler,
  loggingMiddleware,    // outermost: logs first, logs last
  corsMiddleware(["http://localhost:3000"]),  // middle
  timingMiddleware      // innermost: closest to handler
);
```

When a request arrives:
1. `loggingMiddleware` logs the request
2. `corsMiddleware` checks the origin
3. `timingMiddleware` starts the timer
4. `baseHandler` runs
5. `timingMiddleware` adds the timing header
6. `corsMiddleware` adds CORS headers
7. `loggingMiddleware` logs the response

## Middleware vs. Middleware Factory

There is an important distinction between a middleware and a middleware factory:

```typescript
// Middleware - no configuration needed
const timingMiddleware: Middleware = (handler) => { ... };

// Middleware factory - takes config, returns a Middleware
function corsMiddleware(origins: string[]): Middleware { ... }
```

When using `applyMiddleware`, pass the middleware directly or call the factory first:

```typescript
applyMiddleware(
  handler,
  timingMiddleware,              // middleware directly
  corsMiddleware(["http://..."]) // factory called, returns middleware
);
```

## Exercise

Implement four exports in `exercise.ts`:

- `loggingMiddleware` - Log method and URL before the handler, log status after
- `corsMiddleware(allowedOrigins)` - Factory returning CORS middleware with preflight support
- `timingMiddleware` - Add `X-Response-Time` header with millisecond timing
- `applyMiddleware(handler, ...middlewares)` - Compose middlewares around a handler

Run the tests with:

```bash
bun test exercise.test.ts
```

Check the solution with:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
