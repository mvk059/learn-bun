/**
 * Chapter 8.4 - Login Endpoint
 *
 * Credential verification and JWT token issuance.
 */
import { SQL } from "bun";

// TODO: Implement createAuthServer({ port, databaseUrl, jwtSecret })
// Routes:
// POST /api/auth/register → register user (validate, hash, insert)
//   Body: { username, email, password }
//   Success: 201 { data: { id, username, email, role, createdAt } }
//   Errors: 400 (weak password), 409 (duplicate username/email)
//
// POST /api/auth/login → verify credentials, return JWT
//   Body: { username, password }
//   Success: 200 { data: { token, user: { id, username, email, role } } }
//   Failure: 401 { error: "Invalid credentials" } (same message for wrong user OR wrong password)
//
// Returns { server, stop() }
export function createAuthServer(options: {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
}): { server: ReturnType<typeof Bun.serve>; stop: () => void } {
  throw new Error("Not implemented");
}
