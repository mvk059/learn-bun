import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { parseJsonBody, parseJsonBodyOrThrow } = await import(MODULE);

function makeRequest(body?: string, contentType?: string): Request {
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;
  return new Request("http://localhost/test", {
    method: "POST",
    body: body,
    headers,
  });
}

describe("Parsing JSON Body", () => {
  describe("parseJsonBody", () => {
    test("parses valid JSON", async () => {
      const req = makeRequest('{"name":"Test"}', "application/json");
      const result = await parseJsonBody(req);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: "Test" });
      }
    });

    test("returns error for malformed JSON", async () => {
      const req = makeRequest("{invalid json}", "application/json");
      const result = await parseJsonBody(req);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test("returns error for missing Content-Type", async () => {
      const req = makeRequest('{"name":"Test"}');
      const result = await parseJsonBody(req);
      expect(result.success).toBe(false);
    });

    test("returns error for wrong Content-Type", async () => {
      const req = makeRequest('{"name":"Test"}', "text/plain");
      const result = await parseJsonBody(req);
      expect(result.success).toBe(false);
    });

    test("returns error for empty body", async () => {
      const req = makeRequest("", "application/json");
      const result = await parseJsonBody(req);
      expect(result.success).toBe(false);
    });

    test("handles application/json with charset", async () => {
      const req = makeRequest('{"ok":true}', "application/json; charset=utf-8");
      const result = await parseJsonBody(req);
      expect(result.success).toBe(true);
    });
  });

  describe("parseJsonBodyOrThrow", () => {
    test("returns data for valid JSON", async () => {
      const req = makeRequest('{"id":1}', "application/json");
      const data = await parseJsonBodyOrThrow(req);
      expect(data).toEqual({ id: 1 });
    });

    test("throws for invalid JSON", async () => {
      const req = makeRequest("not json", "application/json");
      try {
        await parseJsonBodyOrThrow(req);
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e.message).toBeDefined();
      }
    });

    test("throws for missing Content-Type", async () => {
      const req = makeRequest('{"id":1}');
      try {
        await parseJsonBodyOrThrow(req);
        expect(true).toBe(false);
      } catch (e: any) {
        expect(e.message).toBeDefined();
      }
    });
  });
});
