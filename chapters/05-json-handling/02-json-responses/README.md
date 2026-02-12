# 5.2 JSON Responses

When building an API, one of the most impactful decisions you can make
early on is to adopt a **consistent response shape**. Every endpoint --
whether it returns a single user, a list of products, or an error --
should follow the same envelope structure. This makes life dramatically
easier for anyone consuming your API, because they always know where to
find the data, where to find errors, and how to detect success or
failure.

This lesson introduces the **response envelope pattern** and shows you
how to build a small set of helper functions that produce consistent
JSON responses.

---

## Why Consistent Response Shapes Matter

Consider two different API response styles:

**Inconsistent (bad):**

```json
// GET /users/1
{ "id": 1, "name": "Alice" }

// GET /users/999
{ "message": "Not found" }

// GET /users
[{ "id": 1 }, { "id": 2 }]
```

A client consuming this API has to guess: Is the response an object or
an array? Is there a `message` field or not? How do I know if the
request succeeded?

**Consistent (good):**

```json
// GET /users/1
{ "success": true, "data": { "id": 1, "name": "Alice" } }

// GET /users/999
{ "success": false, "error": "Not found" }

// GET /users
{ "success": true, "data": [{ "id": 1 }, { "id": 2 }], "meta": { ... } }
```

Now every response has a `success` boolean at the top level. If
`success` is `true`, the payload is in `data`. If `success` is `false`,
the error message is in `error`. Pagination metadata, when present,
lives in `meta`. The client can write a single response handler that
works for every endpoint.

---

## The Envelope Pattern

The envelope wraps your actual data in a standardized outer structure:

```typescript
// Success envelope
{
  success: true,
  data: T
}

// Success envelope with metadata
{
  success: true,
  data: T[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}

// Error envelope
{
  success: false,
  error: string
}
```

This pattern has several benefits:

- **Predictable** -- Clients always check `success` first.
- **Extensible** -- You can add fields like `meta`, `warnings`, or
  `requestId` without breaking existing clients.
- **Type-safe** -- The `success` field acts as a discriminant, just like
  the `ParseResult<T>` type from the previous lesson.

---

## Response.json()

Bun's `Response` object supports a static `Response.json()` method that
creates a JSON response with the correct `Content-Type` header
automatically:

```typescript
Response.json({ success: true, data: { id: 1 } });
```

This is equivalent to:

```typescript
new Response(JSON.stringify({ success: true, data: { id: 1 } }), {
  headers: { "Content-Type": "application/json" },
});
```

`Response.json()` is cleaner and handles serialization and headers for
you. It also accepts an optional second argument for status and other
response init options:

```typescript
Response.json({ success: false, error: "Not found" }, { status: 404 });
```

---

## Building Helper Functions

Rather than calling `Response.json()` with the envelope structure in
every handler, create a small set of helper functions:

### successResponse

Wraps data in a success envelope with a default status of 200:

```typescript
function successResponse<T>(data: T, status: number = 200): Response {
  return Response.json({ success: true, data }, { status });
}
```

### createdResponse

A convenience wrapper for 201 Created responses, commonly used after
POST requests that create a new resource:

```typescript
function createdResponse<T>(data: T): Response {
  return successResponse(data, 201);
}
```

### paginatedResponse

Includes pagination metadata alongside the data array:

```typescript
function paginatedResponse<T>(data: T[], meta: PaginationMeta): Response {
  return Response.json({ success: true, data, meta });
}
```

### errorJson

Wraps an error message in the failure envelope:

```typescript
function errorJson(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}
```

---

## Using the Helpers in Handlers

With these helpers, your route handlers become clean and focused on
business logic:

```typescript
app.get("/users/:id", async (req) => {
  const user = await db.findUser(req.params.id);
  if (!user) {
    return errorJson("User not found", 404);
  }
  return successResponse(user);
});

app.post("/users", async (req) => {
  const body = await req.json();
  const user = await db.createUser(body);
  return createdResponse(user);
});

app.get("/users", async (req) => {
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const { users, total } = await db.listUsers(page, limit);
  return paginatedResponse(users, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});
```

---

## Exercise

Open `exercise.ts` and implement four functions:

1. **`successResponse<T>(data, status?)`** -- Wraps data in
   `{ success: true, data }` with the given status (default 200).
2. **`createdResponse<T>(data)`** -- Calls `successResponse` with
   status 201.
3. **`paginatedResponse<T>(data, meta)`** -- Returns
   `{ success: true, data, meta }` with status 200.
4. **`errorJson(message, status)`** -- Returns
   `{ success: false, error: message }` with the given status.

Run the tests to verify:

```bash
bun test
```

---

## Key Takeaways

- Adopt a consistent response envelope (`{ success, data, error, meta }`)
  across your entire API.
- Use `Response.json()` to create JSON responses with proper headers
  automatically.
- Build small helper functions (`successResponse`, `errorJson`, etc.) to
  enforce the envelope pattern.
- The `success` field acts as a discriminant, making it easy for clients
  to branch on success vs. failure.
- Pagination metadata belongs in a `meta` field alongside `data`, not
  mixed into the data array itself.
