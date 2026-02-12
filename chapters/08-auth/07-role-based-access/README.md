# 8.7 Role-Based Access Control

## What You'll Learn

- How to implement Role-Based Access Control (RBAC) in a REST API
- How to enforce ownership checks so members can only modify their own resources
- How admin roles can override ownership restrictions
- How to combine authentication and authorization into a coherent permission model

## Prerequisites

- Completed Lessons 8.4 through 8.6 (Registration, Login, JWT, Account Management)
- Understanding of JWT tokens with embedded role claims
- Familiarity with HTTP status codes 401 (Unauthorized) vs 403 (Forbidden)

## What Is RBAC?

Role-Based Access Control assigns a **role** to each user (e.g., `member`, `admin`)
and uses that role to determine what actions they can perform. This is simpler than
full attribute-based access control (ABAC) but covers the vast majority of real-world
authorization needs.

In our system we have two roles:

| Role    | Can Create | Can Read | Can Delete Own | Can Delete Any |
|---------|-----------|----------|----------------|----------------|
| member  | Yes       | Yes      | Yes            | No             |
| admin   | Yes       | Yes      | Yes            | Yes            |

The key distinction: a **member** can only delete resources they own, while an
**admin** can delete any resource regardless of ownership.

## The Authorization Layer

Authorization happens **after** authentication. The flow is:

1. **Authentication** -- Extract and verify the JWT. If missing or invalid, return
   `401 Unauthorized`.
2. **Authorization** -- Check the user's role and/or ownership. If the user is
   authenticated but lacks permission, return `403 Forbidden`.

```
Request → Is JWT valid? → No  → 401 Unauthorized
                        → Yes → Does user have permission? → No  → 403 Forbidden
                                                           → Yes → Proceed
```

This two-step process is critical. A `401` means "I don't know who you are." A `403`
means "I know who you are, but you're not allowed to do this."

## Ownership Checks

For the `DELETE /api/projects/:id` endpoint, the logic is:

```typescript
// 1. Authenticate
const authUser = await getAuthUser(req);
if (!authUser) {
  return Response.json(
    { error: "Authentication required" },
    { status: 401 }
  );
}

// 2. Find the resource
const rows = await sql`SELECT * FROM projects WHERE id = ${id}`;
if (!rows.length) {
  return Response.json({ error: "Not Found" }, { status: 404 });
}

// 3. Authorize: admin can delete anything, member only their own
const project = rows[0];
if (authUser.role !== "admin" && project.owner_id !== authUser.userId) {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

// 4. Perform the action
await sql`DELETE FROM projects WHERE id = ${id}`;
return new Response(null, { status: 204 });
```

This pattern -- check role, then check ownership -- is reusable across any resource
type (projects, tasks, comments, etc.).

## Route Summary

| Method | Path                  | Auth Required | Role Check           |
|--------|-----------------------|---------------|----------------------|
| POST   | /api/auth/register    | No            | None                 |
| POST   | /api/auth/login       | No            | None                 |
| GET    | /api/projects         | No            | None (public)        |
| POST   | /api/projects         | Yes           | Any authenticated    |
| GET    | /api/projects/:id     | No            | None (public)        |
| DELETE | /api/projects/:id     | Yes           | Owner or Admin       |

## Path Parameter Matching

Since Bun's built-in server does not include a router with named parameters, we
use a small helper function to match URL patterns:

```typescript
function matchPath(
  pattern: string,
  pathname: string
): { matched: boolean; params: Record<string, string> } {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");
  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: {} };
  }
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

This lets you write `matchPath("/api/projects/:id", pathname)` and get back a
params object with `{ id: "some-uuid" }`.

## Promoting a User to Admin

In this lesson, admin promotion happens directly in the database (e.g., in test
setup). In a production system you would have a dedicated admin endpoint or a CLI
command:

```sql
UPDATE users SET role = 'admin' WHERE username = 'admin1';
```

Never let users self-promote through the API unless you have a super-admin
approval workflow.

## Running the Exercise

```bash
cd chapters/08-auth/07-role-based-access

# Run tests against your exercise
bun test exercise.test.ts

# Run tests against the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

## Key Takeaways

1. **Separate authentication from authorization.** Use `401` for "who are you?" and
   `403` for "you can't do that."
2. **Embed the role in the JWT** so authorization checks do not require an extra
   database query on every request.
3. **Ownership checks are the most common authorization pattern.** Users should only
   be able to modify their own resources unless they have an elevated role.
4. **Admin is a superset of member permissions.** Keep the hierarchy simple and
   check `role === "admin"` before falling through to ownership checks.
5. **This lesson integrates everything from Chapter 8** -- password hashing,
   registration, login, JWT creation, JWT verification, profile management, and
   now role-based permissions. This is the capstone of the authentication chapter.
