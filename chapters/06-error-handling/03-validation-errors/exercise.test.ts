import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { validateOrThrow, withValidation } = await import(MODULE);

describe("Validation Errors", () => {
  describe("validateOrThrow", () => {
    const nameValidator = (input: any): string[] => {
      const errors: string[] = [];
      if (!input.name || typeof input.name !== "string" || input.name.trim() === "") {
        errors.push("Name is required");
      }
      return errors;
    };

    test("returns data when valid", () => {
      const result = validateOrThrow({ name: "Test" }, nameValidator);
      expect(result).toEqual({ name: "Test" });
    });

    test("throws when invalid", () => {
      try {
        validateOrThrow({}, nameValidator);
        expect(true).toBe(false); // should not reach
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
        expect(e.details).toBeDefined();
      }
    });

    test("thrown error includes validation details", () => {
      try {
        validateOrThrow({ name: "" }, nameValidator);
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e.details.errors).toContain("Name is required");
      }
    });
  });

  describe("withValidation", () => {
    const validator = (input: any): string[] => {
      if (!input.title) return ["Title is required"];
      return [];
    };

    test("calls handler when validation passes", async () => {
      const handler = withValidation(validator, async (req, validData) => {
        return Response.json({ received: validData });
      });

      const req = new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test" }),
      });

      const res = await handler(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.received.title).toBe("Test");
    });

    test("returns 400 when validation fails", async () => {
      const handler = withValidation(validator, async (req, validData) => {
        return Response.json({ received: validData });
      });

      const req = new Request("http://localhost/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await handler(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.errors).toContain("Title is required");
    });

    test("returns 400 for non-JSON body", async () => {
      const handler = withValidation(validator, async (req, validData) => {
        return Response.json({ ok: true });
      });

      const req = new Request("http://localhost/test", {
        method: "POST",
        body: "not json",
      });

      const res = await handler(req);
      expect(res.status).toBe(400);
    });
  });
});
