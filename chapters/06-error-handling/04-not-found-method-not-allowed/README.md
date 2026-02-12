# 6.4 Not Found & Method Not Allowed

## What You'll Learn

- The semantic difference between 404 Not Found and 405 Method Not Allowed
- How to include the `Allow` header in 405 responses per HTTP specification
- Building a route table that tracks methods per path pattern
- Returning consistent JSON error envelopes for all error responses

## Why These Two Status Codes Matter

HTTP status codes are not just numbers. They carry specific meaning that clients, proxies,
and browsers rely on to behave correctly.

**404 Not Found** means the server has no resource at the requested URL. The path itself
is unrecognized. A client receiving this knows the endpoint does not exist.

**405 Method Not Allowed** means the path exists, but the HTTP method used is not
supported for that resource. The client sent a request to the right place, but used the
wrong verb.

Many APIs treat both cases as 404, which loses valuable information. When a client
receives a 405, it knows the resource exists and can inspect the `Allow` header to
discover which methods are valid. This is especially useful for API exploration, debugging,
and auto-generated documentation.

## The Allow Header

RFC 9110 states that a 405 response **must** include an `Allow` header listing the
methods the resource supports:

```
HTTP/1.1 405 Method Not Allowed
Allow: GET, POST
Content-Type: application/json

{"error": "Method Not Allowed"}
```

The `Allow` header is a comma-separated list of HTTP methods. This tells the client
exactly what they can do with this endpoint.

## JSON Error Envelope

For API consistency, every error response should follow the same shape. A simple envelope
works well:

```json
{
  "error": "Not Found"
}
```

```json
{
  "error": "Method Not Allowed"
}
```

Clients can always check for the `error` field to determine if a response represents an
error condition. This is more reliable than checking status codes alone, especially when
proxies or middleware might alter response bodies.

## Route Matching Strategy

To distinguish between "path not found" and "path found but method wrong," your server
needs to track which methods are registered for each path pattern. The approach is:

1. Define routes as a list of `{ method, pattern, handler }` entries.
2. When a request arrives, iterate through all routes.
3. For each route whose pattern matches the requested path, record the method.
4. If one of those methods matches the request method, call its handler.
5. If matching methods were found but none match the request method, return 405 with
   the `Allow` header listing the matching methods.
6. If no pattern matched at all, return 404.

```typescript
// Pseudocode
const matchingMethods = [];
let matchedHandler = null;

for (const route of routes) {
  if (pathMatches(route.pattern, pathname)) {
    matchingMethods.push(route.method);
    if (route.method === req.method) {
      matchedHandler = route;
    }
  }
}

if (matchedHandler) return matchedHandler.handle(req);
if (matchingMethods.length > 0) return methodNotAllowed(matchingMethods);
return notFound();
```

## Path Parameter Matching

Your routes include parameterized paths like `/api/projects/:id`. A simple path matcher
splits both the pattern and the URL by `/` and compares segment by segment:

- If the pattern segment starts with `:`, it matches any value (and captures it).
- Otherwise the segments must be equal.
- Both must have the same number of segments.

```typescript
// Pattern: /api/projects/:id
// URL:     /api/projects/abc123
// Result:  matched = true, params = { id: "abc123" }
```

This gives you route parameters that handlers can use to look up specific resources.

## Putting It All Together

Your server should define these routes:

| Method | Path               | Response                        |
|--------|--------------------|---------------------------------|
| GET    | /api/projects      | 200 with empty array            |
| POST   | /api/projects      | 201 with created project        |
| GET    | /api/projects/:id  | 200 with project by id          |
| PUT    | /api/projects/:id  | 200 with updated project        |
| DELETE | /api/projects/:id  | 204 with no body                |

For any path that does not match any pattern, return:
```json
{ "error": "Not Found" }
```
with status 404.

For any path that matches a pattern but the method is not registered, return:
```json
{ "error": "Method Not Allowed" }
```
with status 405 and an `Allow` header listing valid methods.

## Exercise

Open `exercise.ts` and implement `createServer(port)`:

1. Define a route table with the five routes listed above.
2. Implement a path matcher that handles `:param` segments.
3. On each request, find all matching patterns and collect their methods.
4. Return the appropriate response: matched handler, 405, or 404.

Run the tests with:

```bash
bun test exercise.test.ts
```

Check the solution when ready:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

## Key Takeaways

- 404 means the path does not exist. 405 means the path exists but the method is wrong.
- 405 responses must include an `Allow` header listing valid methods.
- A route table that tracks methods per path pattern enables correct status code selection.
- Consistent JSON error envelopes make client-side error handling predictable.
- Parameterized path matching (`/api/items/:id`) is essential for RESTful APIs.
