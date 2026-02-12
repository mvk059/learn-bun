import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createServer } = await import(MODULE);

let server: any;
let baseUrl: string;

beforeAll(() => {
  server = createServer(0);
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("Not Found & Method Not Allowed", () => {
  test("GET /api/projects returns 200", async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    expect(res.status).toBe(200);
  });

  test("POST /api/projects returns 201", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });
    expect(res.status).toBe(201);
  });

  test("unknown path returns 404 with JSON envelope", async () => {
    const res = await fetch(`${baseUrl}/api/unknown`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.error.toLowerCase()).toContain("not found");
  });

  test("DELETE on /api/projects returns 405", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, { method: "DELETE" });
    expect(res.status).toBe(405);
  });

  test("405 response includes Allow header", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, { method: "DELETE" });
    const allow = res.headers.get("Allow");
    expect(allow).toBeDefined();
    expect(allow).toContain("GET");
    expect(allow).toContain("POST");
  });

  test("405 response has JSON error body", async () => {
    const res = await fetch(`${baseUrl}/api/projects`, { method: "PUT" });
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test("GET on known path with only POST works returns 405", async () => {
    // /api/projects supports GET and POST, but /api/projects/:id supports GET, PUT, DELETE
    const res = await fetch(`${baseUrl}/api/projects/some-id`, { method: "POST" });
    expect(res.status).toBe(405);
    const allow = res.headers.get("Allow");
    expect(allow).toContain("GET");
    expect(allow).toContain("PUT");
    expect(allow).toContain("DELETE");
  });
});
