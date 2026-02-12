# 3.5 Router Module

## Learning Objectives

- Build a reusable Router class for dispatching HTTP requests
- Register route handlers with method + pattern + handler
- Dispatch requests to matched handlers by extracting parameters
- Handle 404 (Not Found) and 405 (Method Not Allowed) properly

---

## Why a Router Class?

In previous lessons we built path matching and parameter extraction as standalone
functions. While that works, real applications have dozens or hundreds of routes.
Without structure, your `fetch` handler turns into an enormous if/else chain:

```typescript
// Without a Router - messy and hard to maintain
fetch(req) {
  const url = new URL(req.url);
  if (req.method === "GET" && url.pathname === "/api/projects") { ... }
  else if (req.method === "GET" && url.pathname.startsWith("/api/projects/")) { ... }
  else if (req.method === "POST" && url.pathname === "/api/projects") { ... }
  else if (req.method === "PUT" && url.pathname.startsWith("/api/projects/")) { ... }
  // ... keeps growing
}
```

A Router class solves this by separating **route registration** from **request
dispatch**. You declare your routes cleanly, and the router figures out which
handler to call at runtime.

---

## Route Registration

Each route is defined by three things:

1. **HTTP method** - GET, POST, PUT, DELETE
2. **URL pattern** - a path string, possibly with `:param` segments
3. **Handler function** - the code that processes the request

The Router provides convenience methods for each HTTP method:

```typescript
const router = new Router();

router.get("/api/projects", (req, params) => Response.json([]));
router.get("/api/projects/:id", (req, params) => Response.json({ id: params.id }));
router.post("/api/projects", async (req, params) => {
  const body = await req.json();
  return Response.json(body, { status: 201 });
});
```

Internally, each call pushes a `{ method, pattern, handler }` object into an
array of registered routes.

---

## Handler Type

Every route handler receives the original `Request` and a `params` object
containing any extracted path parameters:

```typescript
type RouteHandler = (
  req: Request,
  params: Record<string, string>
) => Response | Promise<Response>;
```

Handlers can be synchronous (returning `Response`) or asynchronous (returning
`Promise<Response>`). The router's `handle()` method always returns a
`Promise<Response>` so it works with both.

---

## Request Dispatch

When a request arrives, the router's `handle(req)` method:

1. **Parses** the pathname from `req.url`
2. **Iterates** through all registered routes
3. **Tests** each route's pattern against the pathname using path matching
4. **Checks** if the HTTP method also matches
5. **Calls** the matched handler with `(req, extractedParams)`

The path matching logic is the same `matchPath` concept from lesson 3.3 - split
the pattern and pathname into segments, compare them, and extract `:param`
values.

---

## 404 vs 405: Getting Error Responses Right

There is an important distinction between two error cases:

- **404 Not Found** - No registered route has a pattern that matches the
  requested path. The resource simply does not exist.
- **405 Method Not Allowed** - A route exists for the path, but not for the
  HTTP method used. For example, `GET /api/projects` is registered but the
  client sent `DELETE /api/projects`.

The dispatch logic tracks whether any path matched at all:

```typescript
async handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;
  let pathMatched = false;

  for (const route of this.routes) {
    const result = matchPath(route.pattern, pathname);
    if (result.matched) {
      pathMatched = true;
      if (route.method === req.method) {
        return route.handler(req, result.params);
      }
    }
  }

  if (pathMatched) {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }
  return Response.json({ error: "Not Found" }, { status: 404 });
}
```

This distinction matters for API clients. A 404 tells them the URL is wrong,
while a 405 tells them the URL is right but they need a different HTTP method.

---

## Composing Router with Bun.serve()

The Router integrates cleanly with `Bun.serve()` because `handle()` returns
a `Promise<Response>` - exactly what the `fetch` handler expects:

```typescript
const router = new Router();
router.get("/api/projects", (req, params) => Response.json([]));
router.get("/api/projects/:id", (req, params) => Response.json({ id: params.id }));
router.post("/api/projects", async (req, params) => {
  const body = await req.json();
  return Response.json(body, { status: 201 });
});

const server = Bun.serve({
  port: 3000,
  fetch: (req) => router.handle(req),
});

console.log(`Server running at http://localhost:${server.port}`);
```

This pattern keeps your server setup minimal and your routes easy to read.

---

## Your Task

Implement a `Router` class with the following:

- **`get(pattern, handler)`** - Register a GET route
- **`post(pattern, handler)`** - Register a POST route
- **`put(pattern, handler)`** - Register a PUT route
- **`delete(pattern, handler)`** - Register a DELETE route
- **`handle(req): Promise<Response>`** - Match the request to a registered
  route, extract params, and call the handler
  - If the path matches a route but the method does not, return 405 with
    `{ error: "Method Not Allowed" }`
  - If no path matches any route, return 404 with `{ error: "Not Found" }`

The handler type is:

```typescript
type RouteHandler = (
  req: Request,
  params: Record<string, string>
) => Response | Promise<Response>;
```

Use the `matchPath` function concept from lesson 3.3 internally to test
patterns against pathnames and extract parameters.

---

## Running Tests

```bash
# Test your exercise
bun test exercise.test.ts

# Test the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

---

## Key Takeaways

- A Router class separates route registration from dispatch logic
- Routes are stored as `{ method, pattern, handler }` tuples
- Dispatch iterates routes, matches paths, checks methods, and calls handlers
- 404 means no matching path; 405 means matching path but wrong method
- The `handle()` method returns `Promise<Response>`, making it compatible
  with `Bun.serve()`'s `fetch` handler
