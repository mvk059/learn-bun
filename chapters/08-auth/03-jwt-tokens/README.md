# 8.3 JWT Tokens

## What You'll Learn

- What JSON Web Tokens (JWTs) are and how they work
- Creating tokens with the `jose` library and HS256 algorithm
- Verifying tokens and handling invalid or expired tokens
- Decoding token payloads without verification
- Structuring token payloads for authentication

## Prerequisites

- Chapter 8.2 (User Registration) completed
- Basic understanding of Base64 encoding
- The `jose` npm package installed (`bun add jose`)

## Introduction

After a user registers and logs in, your server needs a way to identify them on
subsequent requests without asking for their password every time. JSON Web Tokens
(JWTs) solve this problem by encoding user identity into a cryptographically signed
string that the client sends with each request.

A JWT consists of three Base64URL-encoded parts separated by dots:

```
header.payload.signature
```

- **Header**: Specifies the algorithm (e.g., HS256) and token type (JWT).
- **Payload**: Contains claims -- key-value pairs like `userId`, `role`, `exp`
  (expiration), and `iat` (issued at).
- **Signature**: A cryptographic hash of the header and payload, created using a
  secret key. This ensures the token has not been tampered with.

## The jose Library

The `jose` library is a modern, standards-compliant JWT implementation that works
across JavaScript runtimes including Bun, Node.js, and browsers. It provides a
clean builder-pattern API for creating tokens and a straightforward function for
verification.

### Creating a Token

```typescript
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode("your-secret-key");

const token = await new SignJWT({ userId: "123", role: "admin" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("24h")
  .sign(secret);
```

Key steps:

1. **Encode the secret** -- `jose` expects a `Uint8Array`, so use `TextEncoder`.
2. **Create a `SignJWT`** -- Pass your custom claims as the constructor argument.
3. **Set the header** -- `HS256` (HMAC with SHA-256) is a symmetric algorithm,
   meaning the same secret is used for signing and verification.
4. **Set standard claims** -- `setIssuedAt()` records when the token was created.
   `setExpirationTime("24h")` makes the token expire after 24 hours.
5. **Sign** -- Produces the final JWT string.

### Verifying a Token

```typescript
const { payload } = await jwtVerify(token, secret);
console.log(payload.userId); // "123"
console.log(payload.role);   // "admin"
```

`jwtVerify` checks the signature and validates standard claims like `exp`. If the
token is invalid, expired, or signed with a different key, it throws an error.

### Decoding Without Verification

Sometimes you need to read a token's payload without verifying it -- for example,
to check the expiration time on the client side. Since the payload is just
Base64URL-encoded JSON, you can decode it directly:

```typescript
function decodeToken(token: string): any {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  return JSON.parse(atob(parts[1]));
}
```

**Warning**: Never trust decoded-but-unverified tokens for authorization decisions
on the server. Always verify the signature first.

## HS256 vs RS256

| Feature       | HS256 (Symmetric)          | RS256 (Asymmetric)           |
|---------------|----------------------------|------------------------------|
| Key type      | Single shared secret       | Public/private key pair      |
| Speed         | Faster                     | Slower                       |
| Use case      | Single service              | Distributed / microservices  |
| Key sharing   | Secret must stay on server | Public key can be shared     |

For a single-server application, HS256 is simpler and faster. RS256 becomes
important when multiple services need to verify tokens without having access to
the signing key.

## Token Payload Structure

A well-designed payload includes:

```typescript
interface TokenPayload {
  userId: string;    // Who this token identifies
  role: string;      // What permissions they have
  iat: number;       // Issued at (set automatically)
  exp: number;       // Expiration (set automatically)
}
```

Keep payloads small. JWTs are sent with every request, typically in the
`Authorization` header. Large payloads increase bandwidth usage. Store only the
minimum information needed to identify and authorize the user.

## Token Expiration

Tokens should always have an expiration time. Common durations:

| Token Type    | Duration | Use Case                          |
|---------------|----------|-----------------------------------|
| Access token  | 15m-24h  | Short-lived, used for API access  |
| Refresh token | 7d-30d   | Long-lived, used to get new access tokens |

In this lesson we use a single access token with a 24-hour expiration for
simplicity. Production systems typically use a two-token strategy with short-lived
access tokens and longer-lived refresh tokens.

## Security Considerations

- **Keep secrets secret**: Never commit JWT secrets to version control. Use
  environment variables.
- **Use sufficient key length**: For HS256, keys should be at least 32 characters.
- **Always set expiration**: Tokens without `exp` are valid forever if compromised.
- **Do not store sensitive data in tokens**: Payloads are encoded, not encrypted.
  Anyone can decode and read them.
- **Use HTTPS**: Tokens sent over HTTP can be intercepted.

## Exercise

Open `exercise.ts` and implement the `TokenService` class with three methods:

1. `createToken(payload)` -- Sign a JWT with HS256 and 24-hour expiration.
2. `verifyToken(token)` -- Verify and return the payload, or null if invalid.
3. `decodeToken(token)` -- Decode without verification, or null if malformed.

Run the tests to verify:

```bash
bun test exercise.test.ts
```

## Key Takeaways

- JWTs encode identity claims into a signed, portable string.
- The `jose` library provides a clean API for creating and verifying tokens.
- HS256 uses a shared secret -- keep it long and keep it private.
- Always set token expiration to limit the damage from compromised tokens.
- Decoding is not the same as verifying -- never trust unverified tokens on the
  server.

## Next Steps

In the next lesson, you will build a login endpoint that authenticates users with
their password and returns a JWT for subsequent API requests.
