/**
 * Chapter 8.6 - Account Management
 *
 * Profile updates and account deletion.
 */
import { SQL } from "bun";

// TODO: Implement createAccountServer({ port, databaseUrl, jwtSecret })
// Routes (in addition to register/login from 8.4):
// PUT /api/auth/profile → Update email and/or password (requires auth)
//   Body: { email?, currentPassword?, newPassword? }
//   - To change password: must provide currentPassword and newPassword
//   - Wrong currentPassword → 400
//   - Returns updated user (sans password)
//
// DELETE /api/auth/account → Delete own account (requires auth)
//   - Deletes user from DB
//   - Returns 204
//
// Returns { server, stop() }
export function createAccountServer(options: {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
}): { server: ReturnType<typeof Bun.serve>; stop: () => void } {
  throw new Error("Not implemented");
}
