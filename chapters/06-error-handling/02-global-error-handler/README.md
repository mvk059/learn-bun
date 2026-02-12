# 6.2 Global Error Handler

## What You'll Learn

- How to build a catch-all wrapper for HTTP request handlers
- Mapping custom error types to appropriate HTTP responses
- Preventing internal information leaks in production environments
- The difference between development and production error detail

## The Problem: Scattered Error Handling

Without a centralized error handler, every route in your application ends up
with its own try/catch block:

```typescript
async function getUser(req: Request): Promise<Response> {
  try {
    const user = await findUser(id);
    return Response.json(user);
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.statusCode });
    }
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
```

Multiply this across dozens of routes and you have a maintenance problem.
The error-to-response mapping logic is duplicated everywhere, and it is easy
for one route to forget to handle a case, leaking stack traces or internal
details to the client.

## The Solution: A Wrapper Function

A global error handler is a higher-order function that wraps your route
handlers. It intercepts any thrown errors and converts them into well-formed
HTTP responses:

```typescript
function withErrorHandling(handler: Handler): Handler {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      // Convert error to response
    }
  };
}
```

This pattern is sometimes called a "catch-all middleware" or "error boundary."
It gives you a single place to define how errors become responses.

## Mapping Errors to Responses

The wrapper needs to handle three categories of thrown values:

### 1. HttpError instances

These are your custom errors from Lesson 6.1. They carry a `statusCode` and a
`message` that are safe to send to the client:

```typescript
if (error instanceof HttpError) {
  const body: Record<string, any> = { error: error.message };
  if (error.details !== undefined) {
    body.details = error.details;
  }
  return Response.json(body, { status: error.statusCode });
}
```

### 2. Generic Error instances

These are unexpected errors -- bugs, database connection failures, null
reference errors. Their messages often contain internal details that should
never reach the client:

```typescript
// BAD: Leaks internal information
return Response.json({ error: error.message }, { status: 500 });
// Could expose: "Connection refused to postgres://admin:secret@db:5432"

// GOOD: Generic message, log the real error server-side
console.error("Unhandled error:", error);
return Response.json({ error: "Internal Server Error" }, { status: 500 });
```

### 3. Non-Error throws

JavaScript allows throwing any value -- strings, numbers, objects. Your
handler should handle these gracefully:

```typescript
// Someone wrote: throw "something went wrong"
// This is not an Error instance, so handle it as unknown
console.error("Unhandled error:", error);
return Response.json({ error: "Internal Server Error" }, { status: 500 });
```

## Information Leaks

One of the most important jobs of a global error handler is preventing
information leaks. An unhandled error message might contain:

- Database connection strings with credentials
- Internal file paths revealing server structure
- SQL queries exposing table and column names
- Stack traces showing which libraries and versions you use

All of this information helps attackers. The global error handler ensures
that only intentional, curated error messages (from `HttpError` subclasses)
reach the client. Everything else gets a generic "Internal Server Error."

## Dev vs Production Error Detail

In development, you often want to see the full error in the response for
faster debugging. A common pattern is to check an environment variable:

```typescript
if (error instanceof HttpError) {
  return Response.json({ error: error.message }, { status: error.statusCode });
}

const isDev = process.env.NODE_ENV !== "production";
const body = isDev
  ? { error: error instanceof Error ? error.message : "Internal Server Error",
      stack: error instanceof Error ? error.stack : undefined }
  : { error: "Internal Server Error" };

return Response.json(body, { status: 500 });
```

In development you get the full message and stack trace. In production, the
client sees only "Internal Server Error" while the real error is logged
server-side.

## Using the Wrapper

Once implemented, you wrap each handler when registering routes:

```typescript
const server = Bun.serve({
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/users") {
      return withErrorHandling(handleUsers)(req);
    }
    return new Response("Not found", { status: 404 });
  },
});
```

Or you can wrap the entire fetch handler:

```typescript
const server = Bun.serve({
  fetch: withErrorHandling(async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/users") return handleUsers(req);
    return new Response("Not found", { status: 404 });
  }),
});
```

The second approach is cleaner -- a single wrapper catches errors from any
route, including routing logic itself.

## Logging

The global error handler is also the right place to add structured logging
for unexpected errors:

```typescript
console.error("Unhandled error:", error);
```

In a real application, you would send this to a logging service with
additional context like the request URL, method, and a request ID. For now,
`console.error` ensures the error is visible in your terminal.

## Exercise

Open `exercise.ts` and implement the `withErrorHandling` function:

1. Return a new handler function that wraps the original in a try/catch
2. If the handler succeeds, return its response unchanged
3. If an `HttpError` is thrown, return a JSON response with the appropriate
   status code, error message, and optional details
4. If any other error is thrown, return a 500 JSON response with a generic
   "Internal Server Error" message

Run the tests to verify:

```bash
bun test
```

## Key Takeaways

- A global error handler eliminates duplicated error-to-response logic across
  your routes.
- `HttpError` messages are intentional and safe to expose; generic `Error`
  messages are not.
- Always log unexpected errors server-side while returning a generic message
  to the client.
- Higher-order functions (functions that return functions) are a natural fit
  for cross-cutting concerns like error handling.
