import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { UserService } = await import(MODULE);

let sql: InstanceType<typeof SQL>;
let userService: InstanceType<typeof UserService>;

beforeAll(async () => {
  sql = new SQL({ url: process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test" });
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(20) DEFAULT 'member', created_at TIMESTAMPTZ DEFAULT NOW())`;
  userService = new UserService(sql);
});

beforeEach(async () => {
  await sql`DELETE FROM users`;
});

afterAll(async () => {
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql.close();
});

describe("User Registration", () => {
  test("registers a new user", async () => {
    const user = await userService.register({
      username: "alice",
      email: "alice@example.com",
      password: "StrongPass1",
    });
    expect(user.id).toBeDefined();
    expect(user.username).toBe("alice");
    expect(user.email).toBe("alice@example.com");
    expect(user.role).toBe("member");
  });

  test("does not return password hash", async () => {
    const user = await userService.register({
      username: "bob",
      email: "bob@example.com",
      password: "StrongPass1",
    });
    expect((user as any).passwordHash).toBeUndefined();
    expect((user as any).password_hash).toBeUndefined();
    expect((user as any).password).toBeUndefined();
  });

  test("throws on duplicate username", async () => {
    await userService.register({ username: "charlie", email: "c1@example.com", password: "StrongPass1" });
    try {
      await userService.register({ username: "charlie", email: "c2@example.com", password: "StrongPass1" });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.statusCode || e.status).toBe(409);
    }
  });

  test("throws on duplicate email", async () => {
    await userService.register({ username: "dave1", email: "dave@example.com", password: "StrongPass1" });
    try {
      await userService.register({ username: "dave2", email: "dave@example.com", password: "StrongPass1" });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.statusCode || e.status).toBe(409);
    }
  });

  test("throws on weak password", async () => {
    try {
      await userService.register({ username: "weak", email: "weak@example.com", password: "abc" });
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.statusCode || e.status).toBe(400);
    }
  });

  test("hashes password in database", async () => {
    await userService.register({ username: "eve", email: "eve@example.com", password: "StrongPass1" });
    const rows = await sql`SELECT password_hash FROM users WHERE username = 'eve'`;
    expect(rows[0].password_hash).toStartWith("$argon2id$");
    expect(rows[0].password_hash).not.toBe("StrongPass1");
  });
});
