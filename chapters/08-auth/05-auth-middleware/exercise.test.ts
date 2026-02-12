import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createProtectedServer } = await import(MODULE);

let sql: InstanceType<typeof SQL>;
let app: any;
let baseUrl: string;

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test";
  sql = new SQL({ url: dbUrl });
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(20) DEFAULT 'member', created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL, description TEXT DEFAULT '', owner_id VARCHAR(50) NOT NULL, status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW())`;
  app = createProtectedServer({ port: 0, databaseUrl: dbUrl, jwtSecret: "test-secret-key-that-is-at-least-32-characters" });
  baseUrl = `http://localhost:${app.server.port}`;
});

beforeEach(async () => {
  await sql`DELETE FROM projects`;
  await sql`DELETE FROM users`;
});

afterAll(async () => {
  app?.stop?.();
  await sql`DROP TABLE IF EXISTS projects CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql.close();
});

async function registerAndLogin(username: string): Promise<string> {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email: `${username}@test.com`, password: "StrongPass1" }),
  });
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "StrongPass1" }),
  });
  const body = await loginRes.json();
  return body.data.token;
}

describe("Auth Middleware", () => {
  test("GET /api/projects is public (no auth needed)", async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    expect(res.status).toBe(200);
  });

  test("POST /api/projects requires auth", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });
    expect(res.status).toBe(401);
  });

  test("POST /api/projects works with valid token", async () => {
    const token = await registerAndLogin("alice");
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: "Auth Project" }),
    });
    expect(res.status).toBe(201);
  });

  test("POST /api/projects fails with invalid token", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid.token.here",
      },
      body: JSON.stringify({ name: "Test" }),
    });
    expect(res.status).toBe(401);
  });

  test("missing Authorization header returns 401", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
