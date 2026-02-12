import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { Router } = await import(MODULE);

describe("Router Module", () => {
  describe("basic routing", () => {
    test("GET route returns response", async () => {
      const router = new Router();
      router.get("/api/projects", () => Response.json({ items: [] }));

      const req = new Request("http://localhost/api/projects");
      const res = await router.handle(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
    });

    test("POST route returns response", async () => {
      const router = new Router();
      router.post("/api/projects", () => Response.json({ created: true }, { status: 201 }));

      const req = new Request("http://localhost/api/projects", { method: "POST" });
      const res = await router.handle(req);
      expect(res.status).toBe(201);
    });

    test("PUT route returns response", async () => {
      const router = new Router();
      router.put("/api/projects/:id", () => Response.json({ updated: true }));

      const req = new Request("http://localhost/api/projects/123", { method: "PUT" });
      const res = await router.handle(req);
      expect(res.status).toBe(200);
    });

    test("DELETE route returns response", async () => {
      const router = new Router();
      router.delete("/api/projects/:id", () => new Response(null, { status: 204 }));

      const req = new Request("http://localhost/api/projects/123", { method: "DELETE" });
      const res = await router.handle(req);
      expect(res.status).toBe(204);
    });
  });

  describe("path parameters", () => {
    test("extracts params and passes to handler", async () => {
      const router = new Router();
      router.get("/api/projects/:id", (req, params) => {
        return Response.json({ projectId: params.id });
      });

      const req = new Request("http://localhost/api/projects/abc-123");
      const res = await router.handle(req);
      const data = await res.json();
      expect(data.projectId).toBe("abc-123");
    });

    test("extracts multiple params", async () => {
      const router = new Router();
      router.get("/api/projects/:projectId/tasks/:taskId", (req, params) => {
        return Response.json(params);
      });

      const req = new Request("http://localhost/api/projects/p1/tasks/t2");
      const res = await router.handle(req);
      const data = await res.json();
      expect(data.projectId).toBe("p1");
      expect(data.taskId).toBe("t2");
    });
  });

  describe("404 and 405", () => {
    test("returns 404 for unknown path", async () => {
      const router = new Router();
      router.get("/api/projects", () => Response.json([]));

      const req = new Request("http://localhost/api/unknown");
      const res = await router.handle(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Not Found");
    });

    test("returns 405 for wrong method on known path", async () => {
      const router = new Router();
      router.get("/api/projects", () => Response.json([]));

      const req = new Request("http://localhost/api/projects", { method: "DELETE" });
      const res = await router.handle(req);
      expect(res.status).toBe(405);
      const data = await res.json();
      expect(data.error).toBe("Method Not Allowed");
    });
  });

  describe("multiple routes", () => {
    test("dispatches to correct route", async () => {
      const router = new Router();
      router.get("/api/projects", () => Response.json({ type: "list" }));
      router.get("/api/projects/:id", (req, params) => Response.json({ type: "detail", id: params.id }));
      router.post("/api/projects", () => Response.json({ type: "create" }, { status: 201 }));

      const listReq = new Request("http://localhost/api/projects");
      const listRes = await router.handle(listReq);
      expect((await listRes.json()).type).toBe("list");

      const detailReq = new Request("http://localhost/api/projects/p1");
      const detailRes = await router.handle(detailReq);
      const detailData = await detailRes.json();
      expect(detailData.type).toBe("detail");
      expect(detailData.id).toBe("p1");

      const createReq = new Request("http://localhost/api/projects", { method: "POST" });
      const createRes = await router.handle(createReq);
      expect(createRes.status).toBe(201);
    });
  });

  describe("integration with Bun.serve", () => {
    let server: ReturnType<typeof Bun.serve>;

    afterAll(() => {
      server?.stop(true);
    });

    test("works as fetch handler", async () => {
      const router = new Router();
      router.get("/health", () => Response.json({ status: "ok" }));

      server = Bun.serve({
        port: 0,
        fetch: (req) => router.handle(req),
      });

      const res = await fetch(`http://localhost:${server.port}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
    });
  });
});
