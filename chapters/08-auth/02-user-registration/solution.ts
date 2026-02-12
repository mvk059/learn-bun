/**
 * Chapter 8.2 - User Registration (Solution)
 */
import { SQL } from "bun";

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface SafeUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Must contain uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Must contain lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Must contain a number");
  return errors;
}

export class UserService {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async register(input: RegisterInput): Promise<SafeUser> {
    const pwErrors = validatePasswordStrength(input.password);
    if (pwErrors.length > 0) {
      throw new HttpError(400, pwErrors.join(", "));
    }

    const existingUsername = await this.sql`SELECT id FROM users WHERE username = ${input.username}`;
    if (existingUsername.length > 0) {
      throw new HttpError(409, "Username already taken");
    }

    const existingEmail = await this.sql`SELECT id FROM users WHERE email = ${input.email}`;
    if (existingEmail.length > 0) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = await Bun.password.hash(input.password, { algorithm: "argon2id" });

    const rows = await this.sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${input.username}, ${input.email}, ${passwordHash})
      RETURNING id, username, email, role, created_at
    `;

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    };
  }
}
