import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createRbacServer } = await import(MODULE);

let sql: InstanceType<typeof SQL>;
let app: any;
let baseUrl: string;

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test";
  sql = new SQL({ url: dbUrl });
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(20) DEFAULT 'member', created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL, description TEXT DEFAULT '', owner_id UUID NOT NULL, status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW())`;
  app = createRbacServer({ port: 0, databaseUrl: dbUrl, jwtSecret: "test-secret-key-that-is-at-least-32-characters" });
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

async function registerAndLogin(username: string, role: string = "member"): Promise<{ token: string; userId: string }> {
  await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email: `${username}@test.com`, password: "StrongPass1" }),
  });
  if (role === "admin") {
    await sql`UPDATE users SET role = 'admin' WHERE username = ${username}`;
  }
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "StrongPass1" }),
  });
  const body = await res.json();
  return { token: body.data.token, userId: body.data.user.id };
}

describe("Role-Based Access Control", () => {
  test("member can create own project", async () => {
    const { token } = await registerAndLogin("alice");
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: "Alice's Project" }),
    });
    expect(res.status).toBe(201);
  });

  test("member can delete own project", async () => {
    const { token, userId } = await registerAndLogin("bob");
    const createRes = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: "Bob's Project" }),
    });
    const { data } = await createRes.json();
    const delRes = await fetch(`${baseUrl}/api/projects/${data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(delRes.status).toBe(204);
  });

  test("member cannot delete another's project (403)", async () => {
    const owner = await registerAndLogin("owner1");
    const other = await registerAndLogin("other1");

    const createRes = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${owner.token}` },
      body: JSON.stringify({ name: "Owner's Project" }),
    });
    const { data } = await createRes.json();

    const delRes = await fetch(`${baseUrl}/api/projects/${data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${other.token}` },
    });
    expect(delRes.status).toBe(403);
  });

  test("admin can delete any project", async () => {
    const member = await registerAndLogin("member1");
    const admin = await registerAndLogin("admin1", "admin");

    const createRes = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${member.token}` },
      body: JSON.stringify({ name: "Member Project" }),
    });
    const { data } = await createRes.json();

    const delRes = await fetch(`${baseUrl}/api/projects/${data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    expect(delRes.status).toBe(204);
  });

  test("unauthenticated delete returns 401", async () => {
    const { token } = await registerAndLogin("user1");
    const createRes = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: "Test" }),
    });
    const { data } = await createRes.json();

    const delRes = await fetch(`${baseUrl}/api/projects/${data.id}`, { method: "DELETE" });
    expect(delRes.status).toBe(401);
  });
});
