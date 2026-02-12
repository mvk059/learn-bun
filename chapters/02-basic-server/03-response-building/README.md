# 2.3 Response Building

## Learning Objectives

By the end of this lesson, you will be able to:

- Create reusable response helper functions
- Understand HTTP status codes and when to use each
- Set headers correctly on Response objects
- Work with different content types (JSON, HTML, redirects)

---

## Concepts

### The Response Constructor

Every HTTP response in Bun is a `Response` object. The constructor takes two arguments:

```typescript
new Response(body, {
  status: 200,
  headers: { "Content-Type": "text/plain" },
});
```

- **body** - The response body. Can be a string, `Blob`, `ArrayBuffer`, `ReadableStream`, or `null`.
- **status** - The HTTP status code (e.g., 200, 404, 500).
- **headers** - An object, `Headers` instance, or array of key-value pairs.

A minimal plain-text response looks like this:

```typescript
new Response("Hello, world!");
```

This defaults to status `200` and `Content-Type: text/plain;charset=utf-8`.

### Response.json()

For JSON responses, the Web API provides a static helper:

```typescript
Response.json({ message: "ok" });
Response.json({ id: 1 }, { status: 201 });
```

This automatically sets `Content-Type: application/json` and stringifies the data for you. However, building your own wrapper gives you more control and consistency across your application.

### Response.redirect()

For redirects, there is a built-in static method:

```typescript
Response.redirect("https://example.com", 302);
```

This sets the `Location` header and the appropriate status code. The status must be one of `301`, `302`, `303`, `307`, or `308`.

### Common HTTP Status Codes

| Code | Name            | Meaning                                      |
|------|-----------------|----------------------------------------------|
| 200  | OK              | Request succeeded                            |
| 201  | Created         | A new resource was created                   |
| 204  | No Content      | Success, but no body to return               |
| 301  | Moved Permanently | Resource permanently moved to a new URL    |
| 302  | Found           | Resource temporarily at a different URL      |
| 400  | Bad Request     | Client sent an invalid request               |
| 404  | Not Found       | The requested resource does not exist        |
| 500  | Internal Server Error | Something went wrong on the server     |

### Content-Type Header

The `Content-Type` header tells the client how to interpret the response body:

- `application/json` - JSON data
- `text/html` - HTML markup
- `text/plain` - Plain text
- `text/css` - CSS stylesheets
- `application/javascript` - JavaScript

Setting the wrong Content-Type can cause browsers to misinterpret responses. For example, returning JSON with `text/plain` means the browser will not parse it as an object -- it will display raw text instead.

### Why Helper Functions?

Without helpers, every route handler ends up with repetitive boilerplate:

```typescript
// Without helpers - repetitive and error-prone
if (url.pathname === "/api/users") {
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

if (url.pathname === "/api/missing") {
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
```

With helpers, the same code becomes concise and consistent:

```typescript
// With helpers - clean and consistent
if (url.pathname === "/api/users") {
  return jsonResponse(users);
}

if (url.pathname === "/api/missing") {
  return errorResponse("Not found", 404);
}
```

Helper functions:

- **Reduce boilerplate** so you write less repetitive code
- **Enforce consistency** so every JSON response has the right Content-Type
- **Prevent mistakes** like forgetting `JSON.stringify()` or misspelling a header
- **Centralize changes** so updating response behavior happens in one place

---

## Key APIs

### Response Constructor

```typescript
// Plain text
const text = new Response("Hello", { status: 200 });

// JSON (manual)
const json = new Response(JSON.stringify({ ok: true }), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});

// Empty body with status 204
const empty = new Response(null, { status: 204 });
```

### Headers Object

```typescript
// Using a plain object
new Response(body, {
  headers: {
    "Content-Type": "application/json",
    "X-Request-Id": "abc123",
  },
});

// Using the Headers class
const headers = new Headers();
headers.set("Content-Type", "text/html");
headers.set("Cache-Control", "max-age=3600");

new Response(body, { headers });
```

### Redirect

```typescript
// Temporary redirect (302)
new Response(null, {
  status: 302,
  headers: { Location: "https://example.com/new" },
});

// Permanent redirect (301)
new Response(null, {
  status: 301,
  headers: { Location: "https://example.com/permanent" },
});
```

---

## Your Task

Implement the following five helper functions in `exercise.ts`:

1. **`jsonResponse(data: unknown, status?: number): Response`**
   Returns a Response with the JSON-stringified data as the body, `Content-Type: application/json`, and the given status code (default `200`).

2. **`errorResponse(message: string, status: number): Response`**
   Returns a JSON response with the shape `{ error: message }` and the given status code. Should set `Content-Type: application/json`.

3. **`redirectResponse(url: string, permanent?: boolean): Response`**
   Returns a redirect response with the `Location` header set to the given URL. If `permanent` is `true`, use status `301`. Otherwise, use status `302` (temporary).

4. **`htmlResponse(html: string): Response`**
   Returns a Response with the HTML string as the body and `Content-Type: text/html`.

5. **`noContentResponse(): Response`**
   Returns a `204 No Content` response with an empty body (use `null` as the body).

---

## Running Tests

```bash
# Test your exercise
bun test exercise.test.ts

# Test the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

---

## Hints

- `JSON.stringify(data)` converts any JavaScript value to a JSON string.
- A `null` body creates a response with no content, which is correct for 204 and redirect responses.
- The `errorResponse` function can reuse `jsonResponse` internally to avoid duplicating logic.
- Default parameter values in TypeScript use the `= value` syntax: `function foo(x: number = 10)`.

---

## Next Steps

In the next lesson, you will use these response helpers to build a complete routing system that handles multiple endpoints and HTTP methods.
