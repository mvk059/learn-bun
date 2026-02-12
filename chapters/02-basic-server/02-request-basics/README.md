# 2.2 Request Basics

## Learning Objectives

- Extract information from HTTP requests
- Parse URLs to access pathname and search parameters
- Read HTTP headers from incoming requests
- Understand the Web Standard Request API
- Use `Response.json()` for convenient JSON responses

---

## The Request Object

When Bun's server receives an HTTP request, it passes a **Request** object to your
`fetch` handler. This is the exact same **Web Standard Request** you would find in
browsers, service workers, and the Fetch API. Because Bun follows web standards,
everything you learn here transfers directly to other JavaScript runtimes and
client-side code.

```typescript
Bun.serve({
  port: 3000,
  fetch(req) {
    // `req` is a standard Web Request object
    console.log(req instanceof Request); // true
    return new Response("Hello");
  },
});
```

---

## Key Request Properties and Methods

### `req.method` - The HTTP Method

Every HTTP request has a method that indicates the intended action. The most
common methods are:

| Method   | Purpose                        |
| -------- | ------------------------------ |
| `GET`    | Retrieve a resource            |
| `POST`   | Create a new resource          |
| `PUT`    | Replace an existing resource   |
| `DELETE` | Remove a resource              |
| `PATCH`  | Partially update a resource    |

```typescript
fetch(req) {
  const method = req.method; // "GET", "POST", "PUT", "DELETE", etc.
  console.log(`Received a ${method} request`);
  return new Response(`Method: ${method}`);
}
```

The `method` property is always an uppercase string.

---

### `new URL(req.url)` - Parsing the URL

The `req.url` property gives you the **full URL** as a string, including the
protocol, host, path, and query string:

```
http://localhost:3000/api/users?page=2&limit=10
```

To break this URL into its components, pass it to the `URL` constructor:

```typescript
fetch(req) {
  const url = new URL(req.url);

  console.log(url.pathname);        // "/api/users"
  console.log(url.search);          // "?page=2&limit=10"
  console.log(url.searchParams);    // URLSearchParams object

  // Access individual query parameters
  const page = url.searchParams.get("page");   // "2"
  const limit = url.searchParams.get("limit"); // "10"

  return new Response(`Path: ${url.pathname}`);
}
```

Key properties of the `URL` object:

| Property         | Example Value              | Description                     |
| ---------------- | -------------------------- | ------------------------------- |
| `pathname`       | `"/api/users"`             | The path portion of the URL     |
| `search`         | `"?page=2&limit=10"`      | The query string (with `?`)     |
| `searchParams`   | `URLSearchParams`          | Parsed query parameters object  |
| `hostname`       | `"localhost"`              | The host name                   |
| `port`           | `"3000"`                   | The port number                 |
| `origin`         | `"http://localhost:3000"`  | Protocol + host + port          |

---

### `req.headers.get()` - Reading Headers

HTTP headers carry metadata about the request. The `req.headers` property is a
standard **Headers** object. Use `.get()` to read individual headers:

```typescript
fetch(req) {
  // Header names are case-insensitive
  const userAgent = req.headers.get("user-agent") ?? "Unknown";
  const contentType = req.headers.get("content-type");
  const authorization = req.headers.get("authorization");

  console.log(`User-Agent: ${userAgent}`);
  console.log(`Content-Type: ${contentType}`);   // null if not present

  return new Response("OK");
}
```

Important details about headers:

- **Case-insensitive**: `"Content-Type"`, `"content-type"`, and `"CONTENT-TYPE"` all work.
- **Returns `null`** when the header is not present.
- Use the **nullish coalescing operator** (`??`) to provide a default for missing headers.

Common request headers you will encounter:

| Header           | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `user-agent`     | Identifies the client (browser, curl, etc.)  |
| `content-type`   | MIME type of the request body                |
| `authorization`  | Authentication credentials                   |
| `accept`         | What response formats the client accepts     |
| `host`           | The target host and port                     |

---

### `Response.json()` - Sending JSON Responses

`Response.json()` is a convenient **static method** that creates a Response with:
- The body set to the JSON-serialized data
- The `Content-Type` header set to `application/json`

```typescript
fetch(req) {
  // Instead of this:
  // return new Response(JSON.stringify({ hello: "world" }), {
  //   headers: { "Content-Type": "application/json" },
  // });

  // You can simply write:
  return Response.json({ hello: "world" });
}
```

You can also pass a status code or additional headers as a second argument:

```typescript
return Response.json({ error: "Not Found" }, { status: 404 });
```

---

## Putting It All Together

Here is a complete example that extracts multiple pieces of information from an
incoming request and echoes them back as JSON:

```typescript
Bun.serve({
  port: 3000,
  fetch(req) {
    const method = req.method;
    const url = new URL(req.url);
    const pathname = url.pathname;
    const userAgent = req.headers.get("user-agent") ?? "Unknown";

    return Response.json({ method, pathname, userAgent });
  },
});
```

Test it with `curl`:

```bash
curl http://localhost:3000/api/hello
# {"method":"GET","pathname":"/api/hello","userAgent":"curl/8.x.x"}

curl -X POST http://localhost:3000/data
# {"method":"POST","pathname":"/data","userAgent":"curl/8.x.x"}
```

---

## Difference Between `??` and `||`

You will see both `??` (nullish coalescing) and `||` (logical OR) used with
headers. They behave differently:

- `??` returns the right side only when the left side is `null` or `undefined`.
- `||` returns the right side when the left side is any falsy value (`null`,
  `undefined`, `""`, `0`, `false`).

```typescript
// If the header is missing, .get() returns null
req.headers.get("content-type") ?? null;    // null when missing
req.headers.get("user-agent") || "Unknown"; // "Unknown" when missing OR empty string
```

Choose based on whether you want to treat an empty string as a valid value or not.

---

## Your Task

Implement `createEchoServer(port: number)` that returns a Bun server. The server
should respond to **every** request with a JSON object containing:

| Field          | Source                                                   |
| -------------- | -------------------------------------------------------- |
| `method`       | The HTTP method (`req.method`)                           |
| `url`          | The full URL string (`req.url`)                          |
| `pathname`     | Just the path portion (`new URL(req.url).pathname`)      |
| `userAgent`    | The `User-Agent` header, or `"Unknown"` if not present   |
| `contentType`  | The `Content-Type` header, or `null` if not present      |

Use `Response.json()` to send the response.

### Hints

1. Start with `Bun.serve()` and return its result.
2. Inside the `fetch` handler, parse the URL with `new URL(req.url)`.
3. Use `req.headers.get()` to read each header.
4. Use `||` for the user-agent fallback (so empty strings also become `"Unknown"`).
5. Use `??` for content-type (so `null` is preserved when the header is missing).

---

## Running Tests

```bash
# Test your exercise
bun test exercise.test.ts

# Test the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```
