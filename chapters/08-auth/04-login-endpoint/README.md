# 8.4 Login Endpoint

## What You'll Learn

- How to build a credential verification flow
- Why you must avoid username enumeration vulnerabilities
- How to issue JWT tokens upon successful authentication
- Best practices for login error messages

## The Login Flow

After users can register (Chapter 8.2) and we understand JWT tokens (Chapter 8.3),
the next step is letting them log in. The login endpoint accepts a username and
password, verifies the credentials, and returns a JWT token the client can use
for subsequent requests.

The complete flow looks like this:

```
Client                          Server
  |                               |
  |  POST /api/auth/login         |
  |  { username, password }       |
  |------------------------------>|
  |                               |  1. Look up user by username
  |                               |  2. Verify password against hash
  |                               |  3. Generate JWT token
  |  200 { token, user }         |
  |<------------------------------|
```

## Preventing Username Enumeration

A critical security principle: **never reveal whether a username exists**.
If your login endpoint returns "User not found" for unknown usernames but
"Wrong password" for known usernames, an attacker can enumerate valid usernames
by observing the different error messages.

The fix is simple: return the **exact same error** for both cases:

```typescript
// BAD - leaks information
if (users.length === 0) {
  return Response.json({ error: "User not found" }, { status: 401 });
}
if (!validPassword) {
  return Response.json({ error: "Wrong password" }, { status: 401 });
}

// GOOD - no information leakage
const invalidMsg = "Invalid credentials";

if (users.length === 0) {
  return Response.json({ error: invalidMsg }, { status: 401 });
}
if (!validPassword) {
  return Response.json({ error: invalidMsg }, { status: 401 });
}
```

Both cases return `401` with the identical message `"Invalid credentials"`.
An attacker cannot distinguish between "user doesn't exist" and "password is wrong".

## Verifying Passwords with Bun

Bun provides `Bun.password.verify()` to check a plaintext password against
a stored hash. It automatically detects the hashing algorithm:

```typescript
const isValid = await Bun.password.verify(plaintext, storedHash);
// Returns true or false
```

This pairs with `Bun.password.hash()` from Chapter 8.1. The verify function
extracts the algorithm and parameters from the hash string itself, so you
don't need to specify them again.

## Issuing a JWT on Login

Once credentials are verified, generate a JWT containing the user's ID and role:

```typescript
import { SignJWT } from "jose";

const secretKey = new TextEncoder().encode(jwtSecret);

async function createToken(payload: { userId: string; role: string }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}
```

The client stores this token (typically in memory or localStorage) and sends
it with future requests via the `Authorization` header.

## Complete Login Handler

Here is how the login route fits together:

```typescript
if (req.method === "POST" && pathname === "/api/auth/login") {
  const body = await req.json();
  const invalidMsg = "Invalid credentials";

  // Step 1: Look up user by username
  const users = await sql`SELECT * FROM users WHERE username = ${body.username}`;
  if (users.length === 0) {
    return Response.json({ error: invalidMsg }, { status: 401 });
  }

  // Step 2: Verify password
  const user = users[0];
  const valid = await Bun.password.verify(body.password, user.password_hash);
  if (!valid) {
    return Response.json({ error: invalidMsg }, { status: 401 });
  }

  // Step 3: Issue token
  const token = await createToken({ userId: user.id, role: user.role });

  return Response.json({
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
}
```

## Response Shapes

**Successful login (200):**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "a1b2c3d4-...",
      "username": "alice",
      "email": "alice@example.com",
      "role": "member"
    }
  }
}
```

**Failed login (401):**

```json
{
  "error": "Invalid credentials"
}
```

## Security Considerations

1. **Same error message** for wrong user and wrong password (prevents enumeration)
2. **Use HTTPS in production** so passwords are encrypted in transit
3. **Rate limiting** (covered later) to prevent brute-force attacks
4. **Token expiration** ensures stolen tokens have limited utility
5. **Never log passwords** -- not even in debug mode

## Timing Attacks

Advanced attackers can measure response times. If you skip password hashing
when the user doesn't exist, the response is faster, leaking information.
A production system might hash a dummy password even when the user is not found
to equalize timing. For this tutorial, we keep it simple, but be aware of
this concern in production systems.

## Exercise

Open `exercise.ts` and implement `createAuthServer` with two routes:

1. **POST /api/auth/register** -- Register a user (reuse logic from 8.2)
2. **POST /api/auth/login** -- Verify credentials and return a JWT

Key requirements:
- Password validation: min 8 chars, uppercase, lowercase, digit
- Same `"Invalid credentials"` error for wrong user and wrong password
- Return a signed JWT token on successful login

Run the tests:

```bash
bun test exercise.test.ts
```

Check the solution when you're ready:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
