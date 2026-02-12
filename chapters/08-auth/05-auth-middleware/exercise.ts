/**
 * Chapter 8.5 - Auth Middleware
 *
 * Protecting routes with Bearer token authentication.
 */
import { SQL } from "bun";

// TODO: Implement createProtectedServer({ port, databaseUrl, jwtSecret })
// Routes:
// POST /api/auth/register → (same as 8.4)
// POST /api/auth/login → (same as 8.4)
// GET  /api/projects → public (no auth required)
// POST /api/projects → requires auth (Bearer token)
//   - Extract token from "Authorization: Bearer <token>"
//   - Verify with jose
//   - If invalid/missing → 401 { error: "..." }
//   - If valid → create project with owner_id = userId from token
//
// Returns { server, stop() }
export function createProtectedServer(options: {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
}): { server: ReturnType<typeof Bun.serve>; stop: () => void } {
  throw new Error("Not implemented");
}
