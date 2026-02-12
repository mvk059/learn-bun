/**
 * Chapter 8.1 - Password Hashing
 *
 * Secure password handling with Bun.password (Argon2id).
 */

// TODO: Hash a password using Bun.password.hash with argon2id algorithm
export async function hashPassword(password: string): Promise<string> {
  throw new Error("Not implemented");
}

// TODO: Verify a password against a hash using Bun.password.verify
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  throw new Error("Not implemented");
}

// TODO: Validate password strength
// Rules: at least 8 characters, at least one uppercase, one lowercase, one number
// Return array of error strings (empty = valid)
export function validatePasswordStrength(password: string): string[] {
  throw new Error("Not implemented");
}
