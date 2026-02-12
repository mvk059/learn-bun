import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { withErrorHandling, HttpError } = await import(MODULE);

describe("Global Error Handler", () => {
  describe("withErrorHandling", () => {
    test("passes through successful response", async () => {
      const handler = withErrorHandling(async () => Response.json({ ok: true }));
      const res = await handler(new Request("http://localhost/test"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
    });

    test("converts HttpError to proper response", async () => {
      const handler = withErrorHandling(async () => {
        throw new HttpError(404, "Project not found");
      });
      const res = await handler(new Request("http://localhost/test"));
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Project not found");
    });

    test("converts generic Error to 500", async () => {
      const handler = withErrorHandling(async () => {
        throw new Error("Something broke");
      });
      const res = await handler(new Request("http://localhost/test"));
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });

    test("handles non-Error throws as 500", async () => {
      const handler = withErrorHandling(async () => {
        throw "string error";
      });
      const res = await handler(new Request("http://localhost/test"));
      expect(res.status).toBe(500);
    });

    test("HttpError preserves status code", async () => {
      const handler = withErrorHandling(async () => {
        throw new HttpError(409, "Already exists");
      });
      const res = await handler(new Request("http://localhost/test"));
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error).toBe("Already exists");
    });

    test("includes details for HttpError when present", async () => {
      const handler = withErrorHandling(async () => {
        throw new HttpError(400, "Validation failed", { fields: ["name"] });
      });
      const res = await handler(new Request("http://localhost/test"));
      const body = await res.json();
      expect(body.details).toEqual({ fields: ["name"] });
    });
  });
});
