import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { parsePath, parseSegments, parseQueryParams, buildUrl } = await import(MODULE);

describe("URL Parsing", () => {
  describe("parsePath", () => {
    test("extracts pathname from full URL", () => {
      expect(parsePath("http://localhost:3000/api/projects")).toBe("/api/projects");
    });

    test("handles root path", () => {
      expect(parsePath("http://localhost:3000/")).toBe("/");
    });

    test("handles URL without trailing slash", () => {
      expect(parsePath("http://localhost:3000")).toBe("/");
    });

    test("ignores query parameters", () => {
      expect(parsePath("http://localhost:3000/api/tasks?status=done")).toBe("/api/tasks");
    });

    test("handles nested paths", () => {
      expect(parsePath("http://localhost:3000/api/projects/123/tasks")).toBe("/api/projects/123/tasks");
    });
  });

  describe("parseSegments", () => {
    test("splits path into segments", () => {
      expect(parseSegments("http://localhost:3000/api/projects/123")).toEqual(["api", "projects", "123"]);
    });

    test("returns empty array for root", () => {
      expect(parseSegments("http://localhost:3000/")).toEqual([]);
    });

    test("handles single segment", () => {
      expect(parseSegments("http://localhost:3000/health")).toEqual(["health"]);
    });

    test("filters empty segments", () => {
      expect(parseSegments("http://localhost:3000/api//projects/")).toEqual(["api", "projects"]);
    });
  });

  describe("parseQueryParams", () => {
    test("extracts single param", () => {
      expect(parseQueryParams("http://localhost:3000/api?page=1")).toEqual({ page: "1" });
    });

    test("extracts multiple params", () => {
      const result = parseQueryParams("http://localhost:3000/api?page=1&limit=10&sort=name");
      expect(result).toEqual({ page: "1", limit: "10", sort: "name" });
    });

    test("returns empty object when no params", () => {
      expect(parseQueryParams("http://localhost:3000/api")).toEqual({});
    });

    test("handles encoded characters", () => {
      const result = parseQueryParams("http://localhost:3000/api?name=hello%20world");
      expect(result.name).toBe("hello world");
    });
  });

  describe("buildUrl", () => {
    test("builds simple URL", () => {
      expect(buildUrl("http://localhost:3000", "/api/projects")).toBe("http://localhost:3000/api/projects");
    });

    test("adds query parameters", () => {
      const url = buildUrl("http://localhost:3000", "/api/tasks", { status: "done", page: "1" });
      const parsed = new URL(url);
      expect(parsed.pathname).toBe("/api/tasks");
      expect(parsed.searchParams.get("status")).toBe("done");
      expect(parsed.searchParams.get("page")).toBe("1");
    });

    test("handles empty params", () => {
      expect(buildUrl("http://localhost:3000", "/api")).toBe("http://localhost:3000/api");
    });

    test("handles base with trailing slash", () => {
      const url = buildUrl("http://localhost:3000/", "/api");
      expect(new URL(url).pathname).toBe("/api");
    });
  });
});
