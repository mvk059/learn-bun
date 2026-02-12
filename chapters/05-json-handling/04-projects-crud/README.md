# 5.4 Projects CRUD Endpoints

## What You'll Learn

- Wiring together routing, validation, services, and response helpers into a complete API
- Implementing all five standard CRUD operations (List, Create, Read, Update, Delete)
- Following the request lifecycle: Route -> Validate -> Service -> Response
- Adding pagination to list endpoints
- Returning correct HTTP status codes for each operation

## The Request Lifecycle

Every request to a REST API follows the same pattern:

```
Client Request
  -> Router (match method + path)
    -> Parse body (if POST/PUT/PATCH)
      -> Validate input
        -> Service layer (business logic + storage)
          -> Build response (status code + JSON body)
            -> Send to client
```

This lesson puts all the pieces together. Previous lessons covered each piece in isolation.
Now we wire them into a working server.

## CRUD Operations for Projects

| Operation | Method | Path                  | Success Status | Response Body                    |
|-----------|--------|-----------------------|----------------|----------------------------------|
| List      | GET    | `/api/projects`       | 200            | `{ success, data: [...], meta }` |
| Create    | POST   | `/api/projects`       | 201            | `{ success, data: project }`     |
| Read      | GET    | `/api/projects/:id`   | 200            | `{ success, data: project }`     |
| Update    | PUT    | `/api/projects/:id`   | 200            | `{ success, data: project }`     |
| Delete    | DELETE | `/api/projects/:id`   | 204            | (no body)                        |

Error responses use `{ success: false, error: "message" }` with the appropriate status
code (400 for validation errors, 404 for not found).

## Path Matching with Parameters

To handle routes like `/api/projects/:id`, we need a small path matcher:

```typescript
function matchPath(
  pattern: string,
  pathname: string
): { matched: boolean; params: Record<string, string> } {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");
  if (patternParts.length !== pathParts.length) return { matched: false, params: {} };

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return { matched: false, params: {} };
    }
  }
  return { matched: true, params };
}
```

This compares each segment of the URL pattern against the actual path. Segments starting
with `:` become named parameters.

## In-Memory Storage

For this exercise we store projects in a `Map<string, Project>`. This keeps things simple
and testable without introducing a database. The same pattern works with any storage
backend -- just swap the Map operations for database calls.

```typescript
const projects = new Map<string, Project>();
```

## Pagination

List endpoints should support pagination to avoid returning unbounded result sets:

```typescript
const page = parseInt(url.searchParams.get("page") ?? "1") || 1;
const limit = parseInt(url.searchParams.get("limit") ?? "10") || 10;
const all = Array.from(projects.values());
const total = all.length;
const totalPages = Math.ceil(total / limit) || 1;
const data = all.slice((page - 1) * limit, page * limit);

return Response.json({
  success: true,
  data,
  meta: { total, page, limit, totalPages },
});
```

The `meta` object tells the client how many results exist and how many pages are available,
so they can build navigation controls.

## curl Examples

Once your server is running, test every operation from the terminal:

```bash
# List all projects (empty at first)
curl http://localhost:3000/api/projects

# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project", "ownerId": "u1", "status": "active"}'

# Get a project by ID (replace <id> with the returned ID)
curl http://localhost:3000/api/projects/<id>

# Update a project
curl -X PUT http://localhost:3000/api/projects/<id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Renamed Project"}'

# Delete a project
curl -X DELETE http://localhost:3000/api/projects/<id>

# List with pagination
curl "http://localhost:3000/api/projects?page=1&limit=2"

# Try creating with invalid input (should return 400)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"description": "no name provided"}'
```

## Status Code Reference

- **200 OK** -- Successful read or update
- **201 Created** -- Successful creation (include the created resource in the body)
- **204 No Content** -- Successful deletion (no response body)
- **400 Bad Request** -- Validation failed (include error details)
- **404 Not Found** -- Resource does not exist

## Exercises

Open `exercise.ts` and implement `createProjectsServer(port)`.

The function should return `{ server, stop }` where `server` is the value from
`Bun.serve()` and `stop` is a function that shuts the server down.

Your server needs to handle all five CRUD routes described above with in-memory storage,
input validation, and proper status codes.

### Running Tests

```bash
# Test your implementation
bun test exercise.test.ts

# Test the provided solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

## Key Takeaways

- A complete CRUD API is just five route handlers following the same lifecycle pattern
- Validate before you act -- reject bad input with 400 before touching storage
- Use 201 for creation, 204 for deletion, and 404 when a resource is missing
- Pagination prevents unbounded responses and is expected by API consumers
- Keep the server creation in a function that accepts a port so tests can use port 0
  (auto-assign) for parallel test runs
- In-memory storage with a Map is a clean stand-in during development; the handler
  logic stays the same when you switch to a real database
