# 3.2 Method Routing

## Learning Objectives

By the end of this lesson you will be able to:

- Route requests based on the HTTP method
- Handle GET and POST requests differently on the same path
- Return proper HTTP status codes (200, 201, 404, 405)
- Implement 404 Not Found and 405 Method Not Allowed responses
- Read a JSON request body with `req.json()`
- Store data in an in-memory array

---

## HTTP Methods and Their Semantics

Every HTTP request includes a **method** (also called a "verb") that tells the server
what the client wants to do. The most common methods are:

| Method   | Purpose               | Typical Status Code |
| -------- | --------------------- | ------------------- |
| `GET`    | Read / retrieve data  | 200 OK              |
| `POST`   | Create a new resource | 201 Created         |
| `PUT`    | Update / replace      | 200 OK              |
| `DELETE` | Remove a resource     | 200 or 204          |

A well-designed API uses these methods on the **same path** to perform different
operations. For example, `GET /api/projects` lists all projects, while
`POST /api/projects` creates a new one.

---

## Method-Based Routing

In Bun, the incoming `Request` object exposes a `.method` property that contains
the HTTP method as an uppercase string (`"GET"`, `"POST"`, etc.). You can combine
this with path checking to build a simple router:

```typescript
fetch(req) {
  const url = new URL(req.url);

  if (url.pathname === "/api/projects") {
    if (req.method === "GET") {
      // handle read
    }
    if (req.method === "POST") {
      // handle create
    }
    return new Response("Method Not Allowed", { status: 405 });
  }

  return new Response("Not Found", { status: 404 });
}
```

The structure is straightforward:

1. Check the **path** first.
2. Inside the path block, branch on the **method**.
3. If the path matches but no method branch handles the request, return **405**.
4. If no path matches at all, return **404**.

---

## 404 Not Found vs 405 Method Not Allowed

These two status codes are easy to confuse but mean different things:

- **404 Not Found** -- The requested path does not exist on this server. The client
  asked for a resource the server knows nothing about.
- **405 Method Not Allowed** -- The path exists, but the HTTP method used is not
  supported for that path. For example, sending a `DELETE` to an endpoint that only
  supports `GET` and `POST`.

Returning the correct code helps API consumers debug their requests quickly.

---

## POST and 201 Created

When a `POST` request successfully creates a new resource, the server should return
status **201 Created** instead of a plain 200. This tells the client that the
request was successful *and* that a new resource was created as a result.

In Bun you can set this with `Response.json()`:

```typescript
return Response.json(newProject, { status: 201 });
```

---

## Reading a JSON Request Body

When a client sends JSON in a POST request, you read it with `req.json()`. This
method returns a `Promise` that resolves to the parsed JavaScript object:

```typescript
const body = await req.json();
console.log(body.name); // whatever the client sent
```

Because `req.json()` is asynchronous, make sure your `fetch` handler is declared
as `async`:

```typescript
async fetch(req) {
  const body = await req.json();
  // ...
}
```

---

## In-Memory Data Storage

For prototyping and learning, you can store data in a plain JavaScript array that
lives in the server's memory. The array persists as long as the server process is
running:

```typescript
const projects: Project[] = [];

// Later, inside POST handler:
projects.push(newProject);

// Inside GET handler:
return Response.json(projects);
```

Keep in mind that in-memory storage is **not persistent** -- restarting the server
wipes all data. In later chapters we will connect to real databases.

---

## Generating Unique IDs

Every item you store needs a unique identifier. The Web Crypto API gives you a
simple way to generate one:

```typescript
const id = crypto.randomUUID();
// e.g. "3b241101-e2bb-4d7a-8702-9e3f8bc1b44d"
```

This is available globally in Bun (no imports needed) and produces a random UUID v4
string.

---

## Your Task

Create an `exercise.ts` file that exports a `createServer(port: number)` function.

The server must maintain an in-memory `projects` array and support these routes:

| Method | Path              | Behavior                                                         |
| ------ | ----------------- | ---------------------------------------------------------------- |
| GET    | `/api/projects`   | Return the full array as JSON with status 200                    |
| POST   | `/api/projects`   | Parse JSON body, add to array with auto-generated id, return 201 |
| Other  | `/api/projects`   | Return `{ error: "Method Not Allowed" }` with status 405        |
| Any    | Any other path    | Return `{ error: "Not Found" }` with status 404                 |

For the POST handler, expect the body to contain `name` and `description` fields.
Generate an `id` using `crypto.randomUUID()` and include it in the stored object
and the response.

---

## Try It with curl

Start your server, then test it from a terminal:

```bash
# List projects (initially empty)
curl http://localhost:3000/api/projects

# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "description": "A cool project"}'

# List projects again (now contains one item)
curl http://localhost:3000/api/projects

# Try an unsupported method
curl -X PUT http://localhost:3000/api/projects
# → 405 Method Not Allowed

# Try a path that does not exist
curl http://localhost:3000/api/unknown
# → 404 Not Found
```

---

## Run the Tests

```bash
bun test exercise.test.ts
```

When all tests pass, compare your code with `solution.ts`.

---

## Key Takeaways

- Use `req.method` to branch on the HTTP method within a path.
- Return **201** for successful POST operations that create a resource.
- Return **404** when the path does not exist and **405** when the path exists but
  the method is not supported.
- Use `req.json()` (async) to read a JSON request body.
- An in-memory array is a quick way to store data during development.
- `crypto.randomUUID()` generates unique IDs without any imports.
