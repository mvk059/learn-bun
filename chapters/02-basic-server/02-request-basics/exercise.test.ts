import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createEchoServer } = await import(MODULE);

let server: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(() => {
  server = createEchoServer(0);
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("Request Basics", () => {
  test("extracts GET method", async () => {
    const res = await fetch(`${baseUrl}/test`);
    const data = await res.json();
    expect(data.method).toBe("GET");
  });

  test("extracts POST method", async () => {
    const res = await fetch(`${baseUrl}/test`, { method: "POST" });
    const data = await res.json();
    expect(data.method).toBe("POST");
  });

  test("extracts pathname", async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    const data = await res.json();
    expect(data.pathname).toBe("/api/projects");
  });

  test("extracts full URL", async () => {
    const res = await fetch(`${baseUrl}/path?key=value`);
    const data = await res.json();
    expect(data.url).toContain("/path?key=value");
  });

  test("extracts user agent", async () => {
    const res = await fetch(baseUrl, {
      headers: { "User-Agent": "TestClient/1.0" },
    });
    const data = await res.json();
    expect(data.userAgent).toBe("TestClient/1.0");
  });

  test("returns Unknown for missing user agent", async () => {
    const res = await fetch(baseUrl, {
      headers: { "User-Agent": "" },
    });
    const data = await res.json();
    // Empty or missing user agent
    expect(data.userAgent === "Unknown" || data.userAgent === "").toBe(true);
  });

  test("extracts content type when present", async () => {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const data = await res.json();
    expect(data.contentType).toBe("application/json");
  });

  test("returns null for missing content type", async () => {
    const res = await fetch(baseUrl);
    const data = await res.json();
    expect(data.contentType).toBeNull();
  });

  test("response is valid JSON with correct content type", async () => {
    const res = await fetch(baseUrl);
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});
