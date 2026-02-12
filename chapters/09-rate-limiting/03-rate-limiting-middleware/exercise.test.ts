import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createRateLimitedServer } = await import(MODULE);

let server: any;
let baseUrl: string;

beforeAll(() => {
  const result = createRateLimitedServer({ port: 0, maxRequests: 5, windowSeconds: 60 });
  server = result.server;
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server?.stop?.(true);
});

describe("Rate Limiting Middleware", () => {
  test("includes rate limit headers", async () => {
    const res = await fetch(`${baseUrl}/api/test`);
    expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  test("remaining decreases with requests", async () => {
    const res1 = await fetch(`${baseUrl}/api/data`);
    const rem1 = parseInt(res1.headers.get("X-RateLimit-Remaining") || "0");
    const res2 = await fetch(`${baseUrl}/api/data`);
    const rem2 = parseInt(res2.headers.get("X-RateLimit-Remaining") || "0");
    expect(rem2).toBeLessThan(rem1);
  });

  test("returns 429 when limit exceeded", async () => {
    // Use a separate server with very low limit
    const lowLimit = createRateLimitedServer({ port: 0, maxRequests: 2, windowSeconds: 60 });
    const url = `http://localhost:${lowLimit.server.port}`;

    await fetch(`${url}/a`);
    await fetch(`${url}/b`);
    const blocked = await fetch(`${url}/c`);
    expect(blocked.status).toBe(429);

    const body = await blocked.json();
    expect(body.error).toBeDefined();

    lowLimit.server.stop(true);
  });

  test("429 includes Retry-After header", async () => {
    const lowLimit = createRateLimitedServer({ port: 0, maxRequests: 1, windowSeconds: 60 });
    const url = `http://localhost:${lowLimit.server.port}`;

    await fetch(`${url}/x`);
    const blocked = await fetch(`${url}/y`);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeDefined();

    lowLimit.server.stop(true);
  });
});
