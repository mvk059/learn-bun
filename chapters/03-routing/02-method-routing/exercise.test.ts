import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createServer } = await import(MODULE);

let server: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(() => {
  server = createServer(0);
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("Method Routing", () => {
  test("GET /api/projects returns empty array initially", async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("POST /api/projects creates a project", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Project", description: "A test" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Test Project");
    expect(data.description).toBe("A test");
    expect(data.id).toBeDefined();
  });

  test("GET /api/projects returns created projects", async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((p: any) => p.name === "Test Project")).toBe(true);
  });

  test("PUT /api/projects returns 405", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, { method: "PUT" });
    expect(res.status).toBe(405);
    const data = await res.json();
    expect(data.error).toBe("Method Not Allowed");
  });

  test("DELETE /api/projects returns 405", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, { method: "DELETE" });
    expect(res.status).toBe(405);
  });

  test("unknown path returns 404", async () => {
    const res = await fetch(`${baseUrl}/api/unknown`);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Not Found");
  });

  test("root path returns 404", async () => {
    const res = await fetch(baseUrl);
    expect(res.status).toBe(404);
  });
});
