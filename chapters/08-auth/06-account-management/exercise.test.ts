import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createAccountServer } = await import(MODULE);

let sql: InstanceType<typeof SQL>;
let app: any;
let baseUrl: string;

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test";
  sql = new SQL({ url: dbUrl });
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(20) DEFAULT 'member', created_at TIMESTAMPTZ DEFAULT NOW())`;
  app = createAccountServer({ port: 0, databaseUrl: dbUrl, jwtSecret: "test-secret-key-that-is-at-least-32-characters" });
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

async function registerAndLogin(username: string): Promise<{ token: string; user: any }> {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email: `${username}@test.com`, password: "StrongPass1" }),
  });
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "StrongPass1" }),
  });
  const body = await res.json();
  return body.data;
}

describe("Account Management", () => {
  test("PUT /api/auth/profile updates email", async () => {
    const { token } = await registerAndLogin("alice");
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: "newalice@test.com" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.email).toBe("newalice@test.com");
  });

  test("PUT /api/auth/profile requires auth", async () => {
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "x@test.com" }),
    });
    expect(res.status).toBe(401);
  });

  test("password change requires current password", async () => {
    const { token } = await registerAndLogin("bob");
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: "StrongPass1", newPassword: "NewStrong2" }),
    });
    expect(res.status).toBe(200);
  });

  test("wrong current password returns 400", async () => {
    const { token } = await registerAndLogin("carol");
    const res = await fetch(`${baseUrl}/api/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: "WrongPass99", newPassword: "NewStrong2" }),
    });
    expect(res.status).toBe(400);
  });

  test("DELETE /api/auth/account deletes the account", async () => {
    const { token } = await registerAndLogin("dave");
    const res = await fetch(`${baseUrl}/api/auth/account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(204);
  });

  test("deleted user cannot login", async () => {
    const { token } = await registerAndLogin("eve");
    await fetch(`${baseUrl}/api/auth/account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "eve", password: "StrongPass1" }),
    });
    expect(res.status).toBe(401);
  });

  test("DELETE /api/auth/account requires auth", async () => {
    const res = await fetch(`${baseUrl}/api/auth/account`, { method: "DELETE" });
    expect(res.status).toBe(401);
  });
});
