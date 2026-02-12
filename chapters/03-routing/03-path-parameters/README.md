# 3.3 Path Parameters

## Learning Objectives

- Match URL paths against patterns with dynamic segments
- Extract named parameters from URLs
- Implement pattern matching logic from scratch

---

## Concept

In most web applications, URLs are not entirely static. Consider a project management
API where you need to fetch a specific project by its ID:

```
GET /api/projects/abc-123
GET /api/projects/xyz-789
```

Both requests target the same "endpoint" -- they differ only in the project identifier.
Instead of registering a separate route for every possible ID, frameworks use **path
parameters** -- dynamic segments in a URL pattern that match any value and capture it
by name.

### Dynamic Route Segments

A pattern like `/api/projects/:id` tells the router:

1. The first two segments (`api` and `projects`) must match exactly.
2. The third segment (`:id`) is dynamic -- it matches **any** value and captures it
   under the name `id`.

```typescript
// Pattern: /api/projects/:id
// URL:     /api/projects/abc-123
// Result:  { matched: true, params: { id: "abc-123" } }
```

You can have multiple parameters in a single pattern:

```typescript
// Pattern: /api/projects/:projectId/tasks/:taskId
// URL:     /api/projects/p1/tasks/t5
// Result:  { matched: true, params: { projectId: "p1", taskId: "t5" } }
```

### How Pattern Matching Works

The algorithm is straightforward:

1. **Split** both the pattern and the incoming pathname by `"/"`.
2. **Compare segment counts.** If they differ, there is no match.
3. **Walk through each segment pair:**
   - If the pattern segment starts with `:`, it is a parameter. Capture the
     corresponding pathname segment under the parameter name (everything after the `:`).
   - Otherwise, the two segments must be **exactly equal**. If they are not, there is
     no match.
4. If every segment passes, the path matches and you return all captured parameters.

Here is a visual walkthrough:

```
Pattern:  /api/projects/:id
Pathname: /api/projects/abc-123

Split →  ["", "api", "projects", ":id"]
         ["", "api", "projects", "abc-123"]

Segment 0: "" === ""             → ok
Segment 1: "api" === "api"       → ok
Segment 2: "projects" === "projects" → ok
Segment 3: ":id" starts with ":" → capture params.id = "abc-123"

All segments matched → { matched: true, params: { id: "abc-123" } }
```

When a static segment does not match:

```
Pattern:  /api/projects/:id
Pathname: /api/tasks/123

Segment 0: "" === ""             → ok
Segment 1: "api" === "api"       → ok
Segment 2: "projects" !== "tasks" → no match

→ { matched: false, params: {} }
```

### How Frameworks Do This Internally

Frameworks like Express, Hono, and Fastify all implement a version of this logic.
Express uses the `path-to-regexp` library, which compiles route patterns into regular
expressions. Simpler routers (and the one you will build here) use the split-and-compare
approach, which is easier to understand and sufficient for many use cases.

Under the hood, a typical router stores an array of registered routes. When a request
comes in, the router iterates through them, calling a `matchPath` function for each
pattern until it finds one that matches. The extracted params are then made available
to the route handler (e.g., `req.params` in Express).

### Why This Matters for RESTful APIs

REST APIs model resources as URLs. A project is `/api/projects/:id`. A task within
that project is `/api/projects/:projectId/tasks/:taskId`. Path parameters are the
mechanism that lets a single route definition handle every resource of a given type.

Without path parameters, you would need to either:
- Register a route for every possible ID (impossible for dynamic data), or
- Parse the URL manually in every handler (repetitive and error-prone).

Path parameters give you a clean, declarative way to define what a URL looks like
and automatically extract the meaningful parts.

---

## Your Task

Implement the `matchPath` function in `exercise.ts`.

### Function Signature

```typescript
function matchPath(
  pattern: string,
  pathname: string
): { matched: boolean; params: Record<string, string> }
```

### Algorithm

1. Split both `pattern` and `pathname` by `"/"`.
2. If the segment counts differ, return `{ matched: false, params: {} }`.
3. For each segment pair:
   - If the pattern segment starts with `":"`, capture the pathname segment as a
     named parameter (key = everything after the `:`).
   - Otherwise, the segments must match exactly. If they do not, return
     `{ matched: false, params: {} }`.
4. If all segments match, return `{ matched: true, params: { ... } }`.

### Examples

```typescript
matchPath("/api/projects/:id", "/api/projects/abc-123")
// → { matched: true, params: { id: "abc-123" } }

matchPath("/api/projects/:projectId/tasks/:taskId", "/api/projects/p1/tasks/t5")
// → { matched: true, params: { projectId: "p1", taskId: "t5" } }

matchPath("/api/projects/:id", "/api/tasks/123")
// → { matched: false, params: {} }

matchPath("/api/projects", "/api/projects/123")
// → { matched: false, params: {} }
```

---

## Running Tests

```bash
# Run tests against your exercise
bun test exercise.test.ts

# Run tests against the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

---

## Key Takeaways

- Path parameters use `:paramName` syntax to define dynamic URL segments.
- Pattern matching splits the pattern and pathname, then compares segment by segment.
- Segments starting with `:` capture the corresponding URL value as a named parameter.
- Static segments must match exactly; any mismatch means the entire path does not match.
- This is the same core logic that powers routing in Express, Hono, and similar frameworks.
