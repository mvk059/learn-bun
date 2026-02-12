import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { matchPath } = await import(MODULE);

describe("Path Parameters", () => {
  describe("exact matches", () => {
    test("matches exact path", () => {
      const result = matchPath("/api/projects", "/api/projects");
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({});
    });

    test("matches root path", () => {
      const result = matchPath("/", "/");
      expect(result.matched).toBe(true);
    });

    test("does not match different paths", () => {
      const result = matchPath("/api/projects", "/api/tasks");
      expect(result.matched).toBe(false);
    });

    test("does not match different lengths", () => {
      const result = matchPath("/api/projects", "/api/projects/123");
      expect(result.matched).toBe(false);
    });
  });

  describe("single parameter", () => {
    test("extracts :id parameter", () => {
      const result = matchPath("/api/projects/:id", "/api/projects/abc-123");
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ id: "abc-123" });
    });

    test("extracts different parameter names", () => {
      const result = matchPath("/api/users/:userId", "/api/users/u42");
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ userId: "u42" });
    });

    test("non-matching prefix fails", () => {
      const result = matchPath("/api/projects/:id", "/api/tasks/123");
      expect(result.matched).toBe(false);
    });
  });

  describe("multiple parameters", () => {
    test("extracts multiple params", () => {
      const result = matchPath(
        "/api/projects/:projectId/tasks/:taskId",
        "/api/projects/p1/tasks/t5"
      );
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ projectId: "p1", taskId: "t5" });
    });

    test("fails when middle segment doesn't match", () => {
      const result = matchPath(
        "/api/projects/:id/tasks",
        "/api/projects/p1/comments"
      );
      expect(result.matched).toBe(false);
    });
  });

  describe("edge cases", () => {
    test("empty params for non-parameterized match", () => {
      const result = matchPath("/health", "/health");
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({});
    });

    test("parameter can contain special characters", () => {
      const result = matchPath("/api/projects/:id", "/api/projects/proj-abc_123");
      expect(result.matched).toBe(true);
      expect(result.params.id).toBe("proj-abc_123");
    });

    test("returns empty params on no match", () => {
      const result = matchPath("/api/projects/:id", "/api/tasks/123");
      expect(result.params).toEqual({});
    });
  });
});
