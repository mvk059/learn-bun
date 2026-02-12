import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createAuthServer } = await import(MODULE);

let sql: InstanceType<typeof SQL>;
let app: any;
let baseUrl: string;

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test";
  sql = new SQL({ url: dbUrl });
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(20) DEFAULT 'member', created_at TIMESTAMPTZ DEFAULT NOW())`;
  app = createAuthServer({ port: 0, databaseUrl: dbUrl, jwtSecret: "test-secret-key-that-is-at-least-32-characters" });
  baseUrl = `http://localhost:${app.server.port}`;
});

beforeEach(async () => {
  await sql`DELETE FROM users`;
});

afterAll(async () => {
  app?.stop?.();
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql.close();
});

describe("Login Endpoint", () => {
  async function registerUser(username: string, email: string, password: string) {
    return fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  }

  test("POST /api/auth/register creates user", async () => {
    const res = await registerUser("alice", "alice@example.com", "StrongPass1");
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.username).toBe("alice");
    expect(body.data.id).toBeDefined();
  });

  test("POST /api/auth/login succeeds after registration", async () => {
    await registerUser("bob", "bob@example.com", "StrongPass1");
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "bob", password: "StrongPass1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.token).toBeDefined();
    expect(body.data.user.username).toBe("bob");
  });

  test("login fails with wrong password (401)", async () => {
    await registerUser("carol", "carol@example.com", "StrongPass1");
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "carol", password: "WrongPass99" }),
    });
    expect(res.status).toBe(401);
  });

  test("login fails with unknown user (401)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "nobody", password: "StrongPass1" }),
    });
    expect(res.status).toBe(401);
  });

  test("wrong user and wrong password return same error message", async () => {
    await registerUser("dave", "dave@example.com", "StrongPass1");

    const wrongPw = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "dave", password: "WrongPass99" }),
    });
    const wrongUser = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "nobody", password: "StrongPass1" }),
    });

    const body1 = await wrongPw.json();
    const body2 = await wrongUser.json();
    expect(body1.error).toBe(body2.error);
  });

  test("login token is a valid JWT", async () => {
    await registerUser("eve", "eve@example.com", "StrongPass1");
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "eve", password: "StrongPass1" }),
    });
    const body = await res.json();
    const parts = body.data.token.split(".");
    expect(parts.length).toBe(3);
  });
});
