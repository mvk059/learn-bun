import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createApp } = await import(MODULE);

let sql: InstanceType<typeof SQL>;
let app: any;
let baseUrl: string;

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test";
  sql = new SQL({ url: dbUrl });

  // Create tables
  await sql`CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL, description TEXT DEFAULT '', owner_id VARCHAR(50) NOT NULL, status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW())`;

  app = createApp({ port: 0, databaseUrl: dbUrl });
  baseUrl = `http://localhost:${app.server.port}`;
});

beforeEach(async () => {
  await sql`DELETE FROM projects`;
});

afterAll(async () => {
  app?.stop?.();
  await sql`DROP TABLE IF EXISTS projects CASCADE`;
  await sql.close();
});

describe("Wiring Storage to API", () => {
  test("POST /api/projects creates with DB persistence", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "DB Project", description: "Persisted", ownerId: "u1" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe("DB Project");
    expect(body.data.id).toBeDefined();

    // Verify in DB
    const rows = await sql`SELECT * FROM projects WHERE id = ${body.data.id}`;
    expect(rows.length).toBe(1);
  });

  test("GET /api/projects returns DB data", async () => {
    await sql`INSERT INTO projects (name, owner_id) VALUES ('From DB', 'u1')`;
    const res = await fetch(`${baseUrl}/api/projects`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].name).toBe("From DB");
  });

  test("GET /api/projects/:id returns single project", async () => {
    const [row] = await sql`INSERT INTO projects (name, owner_id) VALUES ('Single', 'u1') RETURNING *`;
    const res = await fetch(`${baseUrl}/api/projects/${row.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Single");
  });

  test("GET /api/projects/:id returns 404 for missing", async () => {
    const res = await fetch(`${baseUrl}/api/projects/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });

  test("DELETE /api/projects/:id removes from DB", async () => {
    const [row] = await sql`INSERT INTO projects (name, owner_id) VALUES ('Delete Me', 'u1') RETURNING *`;
    const res = await fetch(`${baseUrl}/api/projects/${row.id}`, { method: "DELETE" });
    expect(res.status).toBe(204);
    const remaining = await sql`SELECT * FROM projects WHERE id = ${row.id}`;
    expect(remaining.length).toBe(0);
  });

  test("supports pagination", async () => {
    for (let i = 0; i < 15; i++) {
      await sql`INSERT INTO projects (name, owner_id) VALUES (${`Project ${i}`}, 'u1')`;
    }
    const res = await fetch(`${baseUrl}/api/projects?page=1&limit=10`);
    const body = await res.json();
    expect(body.data.length).toBe(10);
    expect(body.meta.total).toBe(15);
  });
});
