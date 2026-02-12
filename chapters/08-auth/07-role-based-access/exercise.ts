/**
 * Chapter 8.7 - Role-Based Access Control
 *
 * Fine-grained permissions based on user roles.
 */
import { SQL } from "bun";

// TODO: Implement createRbacServer({ port, databaseUrl, jwtSecret })
// Routes:
// POST /api/auth/register, POST /api/auth/login (same as before)
// GET    /api/projects          → public
// POST   /api/projects          → requires auth, sets owner_id from token
// GET    /api/projects/:id      → public
// DELETE /api/projects/:id      → requires auth:
//   - Admin can delete ANY project
//   - Member can only delete their OWN project (owner_id matches)
//   - Non-owner member → 403 { error: "Forbidden" }
//   - Unauthenticated → 401
//
// Returns { server, stop() }
export function createRbacServer(options: {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
}): { server: ReturnType<typeof Bun.serve>; stop: () => void } {
  throw new Error("Not implemented");
}
