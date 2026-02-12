import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { applyMiddleware, loggingMiddleware, corsMiddleware, timingMiddleware } = await import(MODULE);

type Handler = (req: Request) => Response | Promise<Response>;
type Middleware = (handler: Handler) => Handler;

describe("Middleware Pattern", () => {
  const echoHandler: Handler = (req) => {
    return Response.json({ message: "ok" });
  };

  describe("corsMiddleware", () => {
    test("adds CORS headers to response", async () => {
      const handler = corsMiddleware(["http://localhost:3000"])(echoHandler);
      const req = new Request("http://localhost/api", {
        headers: { Origin: "http://localhost:3000" },
      });
      const res = await handler(req);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    });

    test("handles OPTIONS preflight with 204", async () => {
      const handler = corsMiddleware(["http://localhost:3000"])(echoHandler);
      const req = new Request("http://localhost/api", {
        method: "OPTIONS",
        headers: { Origin: "http://localhost:3000" },
      });
      const res = await handler(req);
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    });

    test("does not add CORS for disallowed origins", async () => {
      const handler = corsMiddleware(["http://allowed.com"])(echoHandler);
      const req = new Request("http://localhost/api", {
        headers: { Origin: "http://evil.com" },
      });
      const res = await handler(req);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });
  });

  describe("timingMiddleware", () => {
    test("adds X-Response-Time header", async () => {
      const handler = timingMiddleware(echoHandler);
      const req = new Request("http://localhost/api");
      const res = await handler(req);
      const timing = res.headers.get("X-Response-Time");
      expect(timing).toBeDefined();
      expect(timing).toContain("ms");
    });
  });

  describe("applyMiddleware", () => {
    test("composes middlewares in order", async () => {
      const handler = applyMiddleware(
        echoHandler,
        timingMiddleware,
        corsMiddleware(["http://localhost:3000"])
      );
      const req = new Request("http://localhost/api", {
        headers: { Origin: "http://localhost:3000" },
      });
      const res = await handler(req);
      expect(res.headers.get("X-Response-Time")).toBeDefined();
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    });
  });
});
