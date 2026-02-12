# 4.2 Handler Pattern

As an API grows, the `fetch` function inside `Bun.serve()` becomes a long chain of
`if/else` branches. Each branch parses the URL, validates the method, reads the body,
queries data, and builds a response. Testing any single behavior requires spinning up
the entire server. The **handler pattern** solves this by extracting each route's logic
into a standalone function.

## What Is a Handler?

A handler is a function that receives a `Request`, a set of route parameters, and any
dependencies it needs (such as a data store), then returns a `Response`. It does not
know about routing, middleware, or the server itself.

```typescript
async function getProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const project = projects.find((p) => p.id === params.id);
  if (!project) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  return Response.json(project);
}
```

The handler receives everything it needs as arguments. It has no hidden dependencies,
no global state, and no side effects beyond mutating the data store it was given. This
makes it trivially testable: pass in a request, parameters, and a mock store, then
assert on the response.

## Separating Routing from Handling

With handlers extracted, the `fetch` function becomes a thin routing layer:

```typescript
fetch(req) {
  const url = new URL(req.url);
  const method = req.method;

  if (method === "GET" && url.pathname === "/api/projects") {
    return listProjectsHandler(req, {}, projects);
  }

  const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch) {
    const params = { id: projectMatch[1] };
    if (method === "GET") return getProjectHandler(req, params, projects);
    if (method === "DELETE") return deleteProjectHandler(req, params, projects);
  }

  if (method === "POST" && url.pathname === "/api/projects") {
    return createProjectHandler(req, {}, projects);
  }

  return Response.json({ error: "Not Found" }, { status: 404 });
}
```

The router matches URLs and methods, extracts parameters, and delegates to handlers.
It contains no business logic. Handlers contain no routing logic. Each can evolve
independently.

## The Handler Signature

Every handler in this pattern follows the same signature:

```typescript
type Handler = (
  req: Request,
  params: Record<string, string>,
  store: Project[]
) => Promise<Response>;
```

- **req** -- The original `Request` object. Handlers can read headers, query
  parameters, and the body from it.
- **params** -- Route parameters extracted by the router (e.g., `{ id: "p1" }`).
- **store** -- The data source. In this lesson it is a simple array; in production
  it would be a database client or repository object.

Returning a `Promise<Response>` allows handlers to perform async work (reading the
request body, querying a database) while keeping the interface uniform.

## Common Handler Patterns

### List with Pagination

A list handler reads `page` and `limit` from query parameters, clamps them to
reasonable bounds, and slices the data:

```typescript
async function listProjectsHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1,
    parseInt(url.searchParams.get("limit") ?? "10", 10) || 10
  ));
  const offset = (page - 1) * limit;
  return Response.json(projects.slice(offset, offset + limit));
}
```

Clamping `limit` between 1 and 100 prevents clients from requesting zero or millions
of records. Defaulting `page` to 1 and `limit` to 10 provides sensible behavior when
no query parameters are present.

### Get by ID

A get handler looks up a single record by its ID parameter:

```typescript
async function getProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const project = projects.find((p) => p.id === params.id);
  if (!project) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  return Response.json(project);
}
```

The pattern is always the same: look it up, return 404 if missing, return 200 with
the data if found.

### Create with Validation

A create handler parses the request body, validates required fields, builds the new
record, and adds it to the store:

```typescript
async function createProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const body = await req.json();
  if (!body.name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  const project: Project = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description ?? "",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  return Response.json(project, { status: 201 });
}
```

Returning 400 for validation failures and 201 for successful creation follows REST
conventions. The `crypto.randomUUID()` API is available globally in Bun and generates
a v4 UUID without any imports.

### Delete

A delete handler finds the record, removes it, and returns 204 (No Content):

```typescript
async function deleteProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const index = projects.findIndex((p) => p.id === params.id);
  if (index === -1) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  projects.splice(index, 1);
  return new Response(null, { status: 204 });
}
```

A 204 response has no body. Using `new Response(null, { status: 204 })` instead of
`Response.json()` makes this explicit.

## Testing Handlers in Isolation

Because handlers are plain functions, tests do not need a running server:

```typescript
test("returns 404 for missing project", async () => {
  const req = new Request("http://localhost/api/projects/missing");
  const res = await getProjectHandler(req, { id: "missing" }, []);
  expect(res.status).toBe(404);
});
```

Create a `Request` object, pass it to the handler with the appropriate params and
store, and assert on the `Response`. No ports, no networking, no cleanup.

The `Request` constructor requires a full URL (including protocol and host), but the
handler only cares about the path and query string. Using `http://localhost` as the
base is a common convention in tests.

## Key Takeaways

- Extract route logic into standalone handler functions.
- Handlers receive `(req, params, store)` and return `Promise<Response>`.
- The router becomes a thin layer that matches URLs and delegates to handlers.
- Handlers are testable without a running server -- just pass in a `Request`.
- Use `Math.max` / `Math.min` to clamp pagination values to safe ranges.
- Return appropriate HTTP status codes: 200 for success, 201 for creation, 204 for
  deletion, 400 for validation errors, 404 for missing resources.
