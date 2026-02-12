import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createProjectsServer } = await import(MODULE);

let server: any;
let baseUrl: string;

beforeAll(() => {
  const result = createProjectsServer(0);
  server = result.server;
  baseUrl = `http://localhost:${server.port}`;
  result.stop; // keep reference
});

afterAll(() => {
  server?.stop?.(true);
});

describe("Projects CRUD Endpoints", () => {
  let createdId: string;

  test("GET /api/projects returns empty array initially", async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  test("POST /api/projects creates a project", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Project",
        description: "A test",
        ownerId: "u1",
        status: "active",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Test Project");
    expect(body.data.id).toBeDefined();
    createdId = body.data.id;
  });

  test("GET /api/projects/:id returns the project", async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdId}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(createdId);
  });

  test("PUT /api/projects/:id updates the project", async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Project" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe("Updated Project");
  });

  test("DELETE /api/projects/:id removes the project", async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdId}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);
  });

  test("GET /api/projects/:id returns 404 after deletion", async () => {
    const res = await fetch(`${baseUrl}/api/projects/${createdId}`);
    expect(res.status).toBe(404);
  });

  test("POST with invalid input returns 400", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "no name" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("GET /api/projects supports pagination", async () => {
    // Create multiple projects
    for (let i = 0; i < 5; i++) {
      await fetch(`${baseUrl}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Project ${i}`, ownerId: "u1", status: "active" }),
      });
    }
    const res = await fetch(`${baseUrl}/api/projects?page=1&limit=2`);
    const body = await res.json();
    expect(body.data.length).toBe(2);
    expect(body.meta.total).toBe(5);
    expect(body.meta.totalPages).toBe(3);
  });

  test("DELETE /api/projects/:id returns 404 for missing", async () => {
    const res = await fetch(`${baseUrl}/api/projects/nonexistent`, { method: "DELETE" });
    expect(res.status).toBe(404);
  });
});
