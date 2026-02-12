import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createTaskManagerServer } = await import(MODULE);

let server: any;
let stopFn: () => void;
let baseUrl: string;
let startedUrl: string | null = null;

beforeAll(() => {
  const result = createTaskManagerServer({
    port: 0,
    onStart: (url: string) => {
      startedUrl = url;
    },
  });
  server = result.server;
  stopFn = result.stop;
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  stopFn();
});

describe("Server Lifecycle", () => {
  test("server starts on a port", () => {
    expect(server.port).toBeGreaterThan(0);
  });

  test("onStart callback is called with URL", () => {
    expect(startedUrl).not.toBeNull();
    expect(startedUrl).toContain("http");
    expect(startedUrl).toContain(String(server.port));
  });

  test("GET /health returns 200", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
  });

  test("GET /health returns status ok with timestamp", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.timestamp).toBeDefined();
    // Verify timestamp is valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  test("unknown route returns 404", async () => {
    const res = await fetch(`${baseUrl}/unknown`);
    expect(res.status).toBe(404);
  });

  test("404 returns JSON error", async () => {
    const res = await fetch(`${baseUrl}/nonexistent`);
    const data = await res.json();
    expect(data.error).toBe("Not Found");
  });

  test("stop function cleanly shuts down server", () => {
    // Create a separate server to test stop
    const result2 = createTaskManagerServer({ port: 0 });
    const port2 = result2.server.port;
    expect(port2).toBeGreaterThan(0);
    result2.stop();
    // After stopping, the server should no longer be running
    // We just verify stop() doesn't throw
  });
});
