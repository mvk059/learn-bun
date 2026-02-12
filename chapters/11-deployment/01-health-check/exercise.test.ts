import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createHealthyServer } = await import(MODULE);

let app: any;
let baseUrl: string;

beforeAll(() => {
  app = createHealthyServer({ port: 0 });
  baseUrl = `http://localhost:${app.server.port}`;
});

afterAll(() => {
  app.stop();
});

describe("Health Check & Graceful Shutdown", () => {
  test("GET /health returns 200", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
  });

  test("health response has status and uptime", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });

  test("health response has timestamp", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();
    expect(body.timestamp).toBeDefined();
  });

  test("stop function works without error", () => {
    const tempApp = createHealthyServer({ port: 0 });
    expect(() => tempApp.stop()).not.toThrow();
  });

  test("GET /ready returns 200", async () => {
    const res = await fetch(`${baseUrl}/ready`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ready");
  });
});
