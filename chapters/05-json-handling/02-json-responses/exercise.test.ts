import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { successResponse, paginatedResponse, errorJson, createdResponse } = await import(MODULE);

describe("JSON Responses", () => {
  describe("successResponse", () => {
    test("returns 200 by default", () => {
      const res = successResponse({ id: 1 });
      expect(res.status).toBe(200);
    });

    test("wraps data in success envelope", async () => {
      const res = successResponse({ id: 1, name: "Test" });
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: 1, name: "Test" });
    });

    test("accepts custom status", () => {
      const res = successResponse({ id: 1 }, 201);
      expect(res.status).toBe(201);
    });

    test("sets Content-Type header", () => {
      const res = successResponse({});
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("createdResponse", () => {
    test("returns 201", () => {
      const res = createdResponse({ id: "abc" });
      expect(res.status).toBe(201);
    });

    test("wraps data in success envelope", async () => {
      const res = createdResponse({ id: "abc", name: "New" });
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("New");
    });
  });

  describe("paginatedResponse", () => {
    test("includes meta with pagination info", async () => {
      const res = paginatedResponse(
        [{ id: 1 }, { id: 2 }],
        { total: 10, page: 1, limit: 2, totalPages: 5 }
      );
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.meta.total).toBe(10);
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(2);
      expect(body.meta.totalPages).toBe(5);
    });

    test("returns 200", () => {
      const res = paginatedResponse([], { total: 0, page: 1, limit: 10, totalPages: 0 });
      expect(res.status).toBe(200);
    });
  });

  describe("errorJson", () => {
    test("returns specified status", () => {
      const res = errorJson("Not found", 404);
      expect(res.status).toBe(404);
    });

    test("wraps error in envelope", async () => {
      const res = errorJson("Bad request", 400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Bad request");
    });

    test("sets Content-Type header", () => {
      const res = errorJson("Error", 500);
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });
});
