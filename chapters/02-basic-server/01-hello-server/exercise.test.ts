import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createServer } = await import(MODULE);

let server: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(() => {
  server = createServer(0); // port 0 = random available port
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("Hello Server", () => {
  test("server starts and is listening", () => {
    expect(server.port).toBeGreaterThan(0);
  });

  test("GET / returns 200", async () => {
    const response = await fetch(baseUrl);
    expect(response.status).toBe(200);
  });

  test("GET / returns correct body", async () => {
    const response = await fetch(baseUrl);
    const text = await response.text();
    expect(text).toBe("Hello from Task Manager API!");
  });

  test("GET /any-path returns same response", async () => {
    const response = await fetch(`${baseUrl}/any/path/here`);
    const text = await response.text();
    expect(text).toBe("Hello from Task Manager API!");
  });

  test("POST also returns same response", async () => {
    const response = await fetch(baseUrl, { method: "POST" });
    const text = await response.text();
    expect(text).toBe("Hello from Task Manager API!");
  });
});
