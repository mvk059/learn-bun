# 6.1 HTTP Error Class

## What You'll Learn

- How to create a custom error hierarchy by extending the built-in `Error` class
- Building specialized error subclasses for common HTTP status codes
- Using TypeScript type guards to safely narrow error types
- Why structured error classes lead to cleaner, more maintainable error handling

## Why Custom Error Classes?

When building HTTP APIs, errors are not exceptional edge cases -- they are a core
part of your application's communication protocol. A 404 means something very
different from a 403, and both carry different information than a 500.

Using plain `Error` objects for everything forces you into awkward patterns:

```typescript
// Without custom errors -- messy and fragile
try {
  const user = await findUser(id);
} catch (err) {
  if (err.message.includes("not found")) {
    return new Response("Not found", { status: 404 });
  } else if (err.message.includes("forbidden")) {
    return new Response("Forbidden", { status: 403 });
  }
  return new Response("Server error", { status: 500 });
}
```

String matching on error messages is brittle. Messages change, they get
translated, they contain dynamic data. Custom error classes solve this by
encoding the *type* of error into the class itself.

## Extending the Error Class

JavaScript's `Error` class is designed to be extended. When you create a
subclass, instances automatically get a stack trace, a message, and they work
with `instanceof` checks:

```typescript
class HttpError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);        // Pass message to Error constructor
    this.name = "HttpError"; // Override the default "Error" name
    this.statusCode = statusCode;
    this.details = details;
  }
}
```

Key points about extending `Error`:

1. **Always call `super(message)`** -- this sets up the internal message and
   stack trace.
2. **Set `this.name`** -- by default, subclasses inherit the parent's name.
   Setting it explicitly makes stack traces and logs more readable.
3. **Add your own properties** -- `statusCode`, `details`, or anything else
   that helps callers handle the error programmatically.

## Building an Error Hierarchy

Once you have a base `HttpError`, you can create subclasses for specific HTTP
status codes. Each subclass encodes its status code internally, so callers
never need to remember which number goes with which error:

```typescript
class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request", details?: any) {
    super(400, message, details);
    this.name = "BadRequestError";
  }
}

class NotFoundError extends HttpError {
  constructor(resource: string, id?: string) {
    const msg = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(404, msg);
    this.name = "NotFoundError";
  }
}
```

Notice how `NotFoundError` takes a *resource name* instead of a raw message.
This enforces a consistent message format across your entire application. Every
"not found" error looks the same in logs and API responses.

## The instanceof Chain

Because these classes form an inheritance chain, `instanceof` checks work at
every level:

```typescript
const err = new NotFoundError("Project", "abc-123");

err instanceof NotFoundError; // true
err instanceof HttpError;     // true
err instanceof Error;         // true
```

This means you can catch broadly (`HttpError`) or narrowly (`NotFoundError`)
depending on what your code needs to do.

## Type Guards

TypeScript type guards let you safely narrow an `unknown` value to a specific
type. This is especially useful in `catch` blocks, where the caught value is
typed as `unknown`:

```typescript
function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
```

The `error is HttpError` return type tells TypeScript that if this function
returns `true`, the value can be treated as an `HttpError` in subsequent code:

```typescript
try {
  await doSomething();
} catch (err) {
  if (isHttpError(err)) {
    // TypeScript knows err.statusCode exists here
    console.log(err.statusCode);
  }
}
```

## Common HTTP Error Subclasses

Here is a reference for the most commonly used HTTP error status codes and when
to use each:

| Status | Class              | When to Use                                  |
|--------|--------------------|----------------------------------------------|
| 400    | BadRequestError    | Invalid input, malformed request body        |
| 401    | UnauthorizedError  | Missing or invalid authentication            |
| 403    | ForbiddenError     | Authenticated but lacking permission         |
| 404    | NotFoundError      | Requested resource does not exist            |
| 409    | ConflictError      | Action conflicts with current state          |

## Best Practices

1. **Default messages**: Give each subclass a sensible default message so
   callers can construct errors with minimal boilerplate.

2. **Structured details**: Use the `details` field for machine-readable context
   like validation errors, conflicting fields, or rate limit info.

3. **Consistent naming**: Always set `this.name` to match the class name. This
   shows up in stack traces and serialized error output.

4. **Keep the hierarchy shallow**: A single base class (`HttpError`) with direct
   subclasses for each status code is usually sufficient. Deep hierarchies add
   complexity without clear benefit.

## Exercise

Open `exercise.ts` and implement:

1. The `HttpError` base class with `statusCode`, `message`, and optional `details`
2. Subclasses: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`,
   `NotFoundError`, and `ConflictError`
3. The `isHttpError` type guard function

Run the tests to verify your implementation:

```bash
bun test
```

## Key Takeaways

- Custom error classes let you encode error semantics into the type system
  rather than relying on string matching or magic numbers.
- Extending `Error` preserves stack traces and works with `instanceof`.
- Type guards bridge the gap between JavaScript's runtime type checks and
  TypeScript's static type system.
- A well-designed error hierarchy makes error handling code shorter, safer,
  and easier to maintain.
