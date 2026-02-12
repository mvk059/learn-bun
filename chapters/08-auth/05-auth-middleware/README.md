# 8.5 Auth Middleware

## What You'll Learn

- How to protect routes with Bearer token authentication
- How to extract and verify JWT tokens from request headers
- The difference between public and protected routes
- How to attach user context to authenticated requests

## The Authorization Header

HTTP uses the `Authorization` header with a "Bearer" scheme to transmit tokens.
When a client has a JWT from the login endpoint, it sends it like this:

```
GET /api/projects HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Your server extracts the token by parsing this header:

```typescript
const authHeader = req.headers.get("authorization");
const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
```

## Public vs Protected Routes

Not every route needs authentication. A typical API has a mix:

| Route                  | Method | Auth Required |
|------------------------|--------|---------------|
| `POST /api/auth/register` | POST   | No            |
| `POST /api/auth/login`    | POST   | No            |
| `GET /api/projects`       | GET    | No (public)   |
| `POST /api/projects`      | POST   | Yes           |
| `DELETE /api/projects/:id`| DELETE | Yes           |

The pattern is straightforward: reading public data is open, but creating,
updating, or deleting resources requires a valid token.

## Building the Auth Helper

Rather than duplicating token verification in every route handler, extract it
into a reusable function:

```typescript
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(jwtSecret);

async function getAuthUser(req: Request): Promise<{ userId: string; role: string } | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return { userId: payload.userId as string, role: payload.role as string };
  } catch {
    return null;
  }
}
```

This function returns `null` for any authentication failure -- missing header,
malformed token, expired token, or invalid signature. The caller decides
what to do with that information.

## Using the Auth Helper in Routes

For protected routes, call `getAuthUser` and check the result:

```typescript
if (req.method === "POST" && pathname === "/api/projects") {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // authUser.userId is available for business logic
  const body = await req.json();
  const rows = await sql`
    INSERT INTO projects (name, description, owner_id)
    VALUES (${body.name}, ${body.description ?? ""}, ${authUser.userId})
    RETURNING *
  `;
  return Response.json({ data: rows[0] }, { status: 201 });
}
```

For public routes, simply skip the auth check:

```typescript
if (req.method === "GET" && pathname === "/api/projects") {
  const rows = await sql`SELECT * FROM projects ORDER BY created_at ASC`;
  return Response.json({ data: [...rows] });
}
```

## Request Context with WeakMap

In larger applications, you might want to attach the authenticated user to the
request object so that deeply nested handlers can access it. Since `Request` is
a built-in object you cannot modify directly, a `WeakMap` is a clean solution:

```typescript
const requestContext = new WeakMap<Request, { userId: string; role: string }>();

// In your auth middleware:
const authUser = await getAuthUser(req);
if (authUser) {
  requestContext.set(req, authUser);
}

// In a route handler:
const user = requestContext.get(req);
```

`WeakMap` is ideal here because entries are automatically garbage-collected
when the `Request` object is no longer referenced, preventing memory leaks.

## Error Responses

Auth middleware should return clear but not overly detailed errors:

```typescript
// Missing token
{ "error": "Authentication required" }  // 401

// Invalid/expired token
{ "error": "Authentication required" }  // 401
```

Just like the login endpoint, avoid revealing specifics about *why*
authentication failed. "Token expired" vs "Token invalid" gives attackers
information. A simple 401 with a generic message is sufficient.

## Optional Authentication

Some routes behave differently based on whether the user is logged in.
For example, a public feed might show extra data to authenticated users:

```typescript
if (req.method === "GET" && pathname === "/api/feed") {
  const authUser = await getAuthUser(req);

  if (authUser) {
    // Return personalized feed
    const rows = await sql`SELECT * FROM posts WHERE ...`;
    return Response.json({ data: [...rows], personalized: true });
  }

  // Return generic public feed
  const rows = await sql`SELECT * FROM posts WHERE public = true`;
  return Response.json({ data: [...rows], personalized: false });
}
```

The key difference: optional auth never returns 401. It just changes behavior
based on whether a valid token is present.

## The Full Pattern

Putting it all together, a server with mixed public and protected routes:

1. Auth routes (register, login) -- no auth needed
2. Public read routes -- no auth needed
3. Protected write routes -- call `getAuthUser`, return 401 if null
4. Optional auth routes -- call `getAuthUser`, adapt response

This pattern scales well. Each route handler makes a clear decision about
whether it requires authentication.

## Exercise

Open `exercise.ts` and implement `createProtectedServer` with these routes:

1. **POST /api/auth/register** -- Register a user (same as 8.4)
2. **POST /api/auth/login** -- Login and get JWT (same as 8.4)
3. **GET /api/projects** -- Public, list all projects
4. **POST /api/projects** -- Protected, create a project (requires valid Bearer token)

Key requirements:
- Extract token from `Authorization: Bearer <token>` header
- Verify token using `jose`'s `jwtVerify`
- Return 401 for missing, malformed, or invalid tokens
- Set `owner_id` on created projects from the token's `userId` claim

Run the tests:

```bash
bun test exercise.test.ts
```

Check the solution when you're ready:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
