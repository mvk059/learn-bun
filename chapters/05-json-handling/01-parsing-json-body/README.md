# 5.1 Parsing JSON Body

In any HTTP API, reading and parsing the request body is one of the most
fundamental operations you will perform. A client sends JSON, your server
reads it, and you need to turn that raw text into a structured object you
can work with. This sounds simple, but real-world code must handle many
failure modes: the client might send malformed JSON, forget to set the
`Content-Type` header, or send an empty body.

This lesson teaches you how to parse JSON request bodies **safely** using
a pattern called **discriminated unions**, giving callers a clear contract
for both success and failure cases.

---

## Why Safe Parsing Matters

Consider the naive approach:

```typescript
const data = await request.json();
```

`Request.json()` will throw if the body is not valid JSON. You end up
wrapping every call site in a try/catch, and the error messages are
generic. Worse, you have no way to distinguish between "the client sent
text/plain" and "the client sent broken JSON" without extra checks
scattered throughout your handlers.

A better approach is to centralize all of that logic into a single
function that returns a **result type** -- a value that explicitly tells
the caller whether parsing succeeded or failed, and carries either the
parsed data or a descriptive error message.

---

## Discriminated Unions

TypeScript supports a pattern called **discriminated unions** (also known
as tagged unions). The idea is to create a union type where each variant
has a literal property that distinguishes it from the others.

```typescript
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

This type has exactly two shapes:

1. **Success** -- `success` is `true` and a `data` field of type `T` is
   present.
2. **Failure** -- `success` is `false` and an `error` field of type
   `string` is present.

The discriminant property is `success`. When you check its value,
TypeScript narrows the type automatically:

```typescript
const result = await parseJsonBody<User>(request);

if (result.success) {
  // TypeScript knows result.data exists here
  console.log(result.data.name);
} else {
  // TypeScript knows result.error exists here
  console.log(result.error);
}
```

This is far more ergonomic than try/catch because:

- The caller is **forced** to handle the error case (the type does not
  have a `data` field unless `success` is `true`).
- No exceptions are thrown, so control flow is linear.
- Error messages are specific and meaningful.

---

## Checking Content-Type

Before attempting to parse JSON, you should verify that the client
actually claims to be sending JSON. The standard way is to check the
`Content-Type` header:

```typescript
const contentType = req.headers.get("content-type");
```

A valid JSON content type looks like `application/json` or
`application/json; charset=utf-8`. The simplest check is to see whether
the header value **includes** the string `"application/json"`:

```typescript
if (!contentType || !contentType.includes("application/json")) {
  return { success: false, error: "Content-Type must be application/json" };
}
```

This handles both the missing header case and the wrong type case in a
single check, and it correctly allows additional parameters like
`charset=utf-8`.

---

## Reading the Body Text

Once you know the content type is correct, read the raw body as text:

```typescript
const text = await req.text();
```

Check for an empty body before parsing. An empty string is technically
not valid JSON, and `JSON.parse("")` throws a somewhat confusing error.
Catching it explicitly gives a clearer message:

```typescript
if (!text || text.trim().length === 0) {
  return { success: false, error: "Request body is empty" };
}
```

---

## Parsing with JSON.parse

Finally, attempt the parse inside a try/catch:

```typescript
try {
  const data = JSON.parse(text) as T;
  return { success: true, data };
} catch (e) {
  return { success: false, error: `Invalid JSON: ${(e as Error).message}` };
}
```

The `as T` assertion tells TypeScript to treat the parsed value as your
expected type. Note that this is a **type assertion**, not runtime
validation -- it does not guarantee the shape of the data at runtime.
(Runtime validation with schemas like Zod is covered in a later lesson.)

---

## The Throwing Variant

Sometimes you want a simpler API where invalid input just throws. You
can build this on top of the safe version:

```typescript
async function parseJsonBodyOrThrow<T>(req: Request): Promise<T> {
  const result = await parseJsonBody<T>(req);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
```

This is useful inside middleware or handlers where you have a top-level
error handler that catches and converts errors to HTTP error responses.

---

## Exercise

Open `exercise.ts` and implement two functions:

1. **`parseJsonBody<T>(req: Request): Promise<ParseResult<T>>`** --
   Returns a discriminated union result. Must check Content-Type, empty
   body, and malformed JSON.

2. **`parseJsonBodyOrThrow<T>(req: Request): Promise<T>`** -- Uses
   `parseJsonBody` internally and throws on failure.

Run the tests to verify:

```bash
bun test
```

---

## Key Takeaways

- Always check `Content-Type` before parsing a request body as JSON.
- Use discriminated unions (`ParseResult<T>`) to model success/failure
  without exceptions.
- TypeScript narrows the type automatically when you check the
  discriminant property.
- Build throwing variants on top of safe variants to offer both APIs.
- Centralize parsing logic in one place to keep handlers clean and
  consistent.
