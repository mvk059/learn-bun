import { describe, test, expect, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { HTTP_STATUS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, createApp } = await import(MODULE);

describe("Project Structure", () => {
  describe("constants", () => {
    test("HTTP_STATUS has common status codes", () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.METHOD_NOT_ALLOWED).toBe(405);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });

    test("DEFAULT_PAGE_SIZE is 10", () => {
      expect(DEFAULT_PAGE_SIZE).toBe(10);
    });

    test("MAX_PAGE_SIZE is 100", () => {
      expect(MAX_PAGE_SIZE).toBe(100);
    });
  });

  describe("createApp", () => {
    let app: any;

    afterAll(() => {
      app?.stop?.();
    });

    test("returns object with server and stop", () => {
      app = createApp({ port: 0 });
      expect(app.server).toBeDefined();
      expect(app.server.port).toBeGreaterThan(0);
      expect(typeof app.stop).toBe("function");
    });

    test("serves health endpoint", async () => {
      if (!app) app = createApp({ port: 0 });
      const res = await fetch(`http://localhost:${app.server.port}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
    });

    test("returns 404 for unknown routes", async () => {
      if (!app) app = createApp({ port: 0 });
      const res = await fetch(`http://localhost:${app.server.port}/unknown`);
      expect(res.status).toBe(404);
    });
  });
});
