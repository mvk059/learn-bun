/**
 * Chapter 8.2 - User Registration
 *
 * Account creation with validation and unique constraints.
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

// TODO: Implement UserService class
// Constructor: takes sql instance
// Methods:
// - register(input: RegisterInput): Promise<SafeUser>
//   1. Validate password strength (8+ chars, uppercase, lowercase, number) → throw { statusCode: 400 }
//   2. Check if username exists → throw { statusCode: 409, message: "Username already taken" }
//   3. Check if email exists → throw { statusCode: 409, message: "Email already registered" }
//   4. Hash password with Bun.password.hash (argon2id)
//   5. Insert user into database
//   6. Return safe user object (without password_hash)
export class UserService {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async register(input: RegisterInput): Promise<SafeUser> {
    throw new Error("Not implemented");
  }
}
