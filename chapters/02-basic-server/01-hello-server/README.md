# 2.1 Hello Server

## Learning Objectives

By the end of this lesson, you will be able to:

- Create an HTTP server using `Bun.serve()`
- Understand the **fetch handler** pattern
- Start and stop servers programmatically
- Use port 0 for test-friendly server creation

---

## Concepts

### Bun's Built-in HTTP Server

Bun ships with a high-performance HTTP server built right in. There is no need to
install Express, Fastify, or any other framework to handle HTTP requests. Just call
`Bun.serve()` and you have a working server.

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello World!");
  },
});

console.log(`Server running at http://localhost:${server.port}`);
```

That is it. No imports, no middleware setup, no boilerplate. Bun gives you a server
out of the box.

### The fetch Handler

The core of every Bun server is the `fetch` handler. This function:

1. **Receives** a standard `Request` object
2. **Returns** a standard `Response` object

```typescript
fetch(req: Request): Response | Promise<Response>
```

This is the same `Request` and `Response` you already know from the browser's
Fetch API. Bun uses **Web Standard APIs** wherever possible, so your knowledge
transfers directly between client and server code.

```typescript
Bun.serve({
  port: 3000,
  fetch(req) {
    // req is a standard Request object
    console.log(req.method);  // "GET", "POST", etc.
    console.log(req.url);     // "http://localhost:3000/some/path"

    // Return a standard Response object
    return new Response("Hello World!");
  },
});
```

Every incoming HTTP request -- regardless of method, path, or headers -- goes
through this single `fetch` function. Later lessons will show you how to route
different paths to different handlers, but for now, every request gets the same
response.

### Web Standard APIs

Bun embraces the Web Standards that browsers have used for years:

| API        | Where You Know It From | How Bun Uses It          |
|------------|------------------------|--------------------------|
| `Request`  | `fetch()` in browsers  | Incoming HTTP requests   |
| `Response` | `fetch()` in browsers  | Outgoing HTTP responses  |
| `Headers`  | `fetch()` in browsers  | Request/response headers |
| `URL`      | `new URL()` in browsers| Parsing request URLs     |

This means you do not need to learn a new API. If you have ever used `fetch()` in
the browser or in Node.js, you already understand the core pattern.

### Starting a Server on a Specific Port

Pass the `port` option to `Bun.serve()` to choose which port the server listens on:

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Listening on port 3000");
  },
});
```

After the call, `server.port` contains the actual port the server is using.

### Stopping a Server

Call `server.stop()` to shut the server down:

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello!");
  },
});

// Later, when you want to stop:
server.stop();
```

Pass `true` to `server.stop(true)` to immediately close all open connections
instead of waiting for them to drain gracefully. This is useful in tests where
you want fast cleanup.

### Port 0 for Tests

When writing tests, you do not want to hard-code a port because it might already
be in use. Use **port 0** to let the operating system assign a random available
port:

```typescript
const server = Bun.serve({
  port: 0, // OS picks an available port
  fetch(req) {
    return new Response("Hello!");
  },
});

console.log(server.port); // e.g., 54321 -- whatever was available
```

This pattern is essential for test suites that may run in parallel.

---

## Key APIs

```typescript
// Create a server
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello World!");
  },
});

// server.port  - the actual port (useful when port: 0)
// server.stop() - stop the server
// server.stop(true) - stop immediately, closing all connections
```

### Response Constructor

```typescript
// Plain text response
new Response("Hello World!");

// With explicit content type
new Response("Hello World!", {
  headers: { "Content-Type": "text/plain" },
});

// With status code
new Response("Not Found", { status: 404 });
```

---

## Your Task

Implement `createServer(port: number)` in `exercise.ts` that:

1. Creates a Bun server on the given port using `Bun.serve()`
2. Responds to **ALL** requests with `"Hello from Task Manager API!"` (text/plain)
3. Returns the server instance

### Example Usage

```typescript
const server = createServer(3000);
console.log(`Server running at http://localhost:${server.port}`);
```

### Testing with curl

Once your server is running, you can test it from the terminal:

```bash
curl http://localhost:3000
# => Hello from Task Manager API!

curl http://localhost:3000/any/path
# => Hello from Task Manager API!

curl -X POST http://localhost:3000
# => Hello from Task Manager API!
```

Every request, regardless of method or path, should return the same response.

---

## Running Tests

```bash
# Run the tests against your exercise
bun test

# Run the tests against the solution
TEST_SOLUTION=1 bun test
```

---

## Hints

<details>
<summary>Hint 1: Basic structure</summary>

Your function needs to call `Bun.serve()` and return the result:

```typescript
export function createServer(port: number) {
  return Bun.serve({
    // configuration goes here
  });
}
```

</details>

<details>
<summary>Hint 2: The fetch handler</summary>

The `fetch` handler receives a `Request` and returns a `Response`:

```typescript
fetch(req) {
  return new Response("your message here");
}
```

</details>

<details>
<summary>Hint 3: Passing the port</summary>

Use the `port` parameter from the function argument in your `Bun.serve()` config:

```typescript
Bun.serve({
  port,  // shorthand for port: port
  fetch(req) { ... },
});
```

</details>

---

## What You Learned

- `Bun.serve()` creates an HTTP server with zero dependencies
- The `fetch` handler is the single entry point for all requests
- Bun uses Web Standard `Request` and `Response` objects
- `server.port` gives you the actual port, which is essential when using port 0
- `server.stop()` shuts down the server cleanly

## Next Lesson

In the next lesson, you will learn how to **route requests** based on the URL path,
so different endpoints return different responses.
