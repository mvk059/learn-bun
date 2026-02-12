import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { validateProject, validateTask, validatePartialProject } = await import(MODULE);

describe("Validation", () => {
  describe("validateProject", () => {
    test("valid project returns empty errors", () => {
      const errors = validateProject({
        name: "My Project",
        description: "A description",
        ownerId: "u1",
        status: "active",
      });
      expect(errors).toEqual([]);
    });

    test("name is required", () => {
      const errors = validateProject({ description: "Desc", ownerId: "u1", status: "active" });
      expect(errors.some((e: string) => e.toLowerCase().includes("name"))).toBe(true);
    });

    test("name must be 1-100 characters", () => {
      const errors = validateProject({ name: "", description: "Desc", ownerId: "u1", status: "active" });
      expect(errors.length).toBeGreaterThan(0);

      const errors2 = validateProject({ name: "x".repeat(101), description: "Desc", ownerId: "u1", status: "active" });
      expect(errors2.length).toBeGreaterThan(0);
    });

    test("description max 500 characters", () => {
      const errors = validateProject({
        name: "Test",
        description: "x".repeat(501),
        ownerId: "u1",
        status: "active",
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    test("description is optional", () => {
      const errors = validateProject({ name: "Test", ownerId: "u1", status: "active" });
      expect(errors).toEqual([]);
    });

    test("collects multiple errors", () => {
      const errors = validateProject({});
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("validateTask", () => {
    test("valid task returns empty errors", () => {
      const errors = validateTask({
        title: "My Task",
        description: "Do something",
        projectId: "p1",
        assigneeId: null,
        status: "todo",
        priority: "medium",
        dueDate: null,
      });
      expect(errors).toEqual([]);
    });

    test("title is required", () => {
      const errors = validateTask({
        title: "",
        projectId: "p1",
        status: "todo",
        priority: "medium",
      });
      expect(errors.some((e: string) => e.toLowerCase().includes("title"))).toBe(true);
    });

    test("validates priority enum", () => {
      const errors = validateTask({
        title: "Task",
        projectId: "p1",
        status: "todo",
        priority: "urgent",
      });
      expect(errors.some((e: string) => e.toLowerCase().includes("priority"))).toBe(true);
    });

    test("validates status enum", () => {
      const errors = validateTask({
        title: "Task",
        projectId: "p1",
        status: "cancelled",
        priority: "low",
      });
      expect(errors.some((e: string) => e.toLowerCase().includes("status"))).toBe(true);
    });

    test("validates dueDate format if provided", () => {
      const errors = validateTask({
        title: "Task",
        projectId: "p1",
        status: "todo",
        priority: "low",
        dueDate: "not-a-date",
      });
      expect(errors.some((e: string) => e.toLowerCase().includes("date"))).toBe(true);
    });

    test("accepts valid dueDate", () => {
      const errors = validateTask({
        title: "Task",
        projectId: "p1",
        status: "todo",
        priority: "low",
        dueDate: "2025-12-31",
      });
      expect(errors).toEqual([]);
    });
  });

  describe("validatePartialProject", () => {
    test("accepts any valid subset of fields", () => {
      expect(validatePartialProject({ name: "Updated" })).toEqual([]);
      expect(validatePartialProject({ description: "New desc" })).toEqual([]);
      expect(validatePartialProject({})).toEqual([]);
    });

    test("still validates field constraints when present", () => {
      const errors = validatePartialProject({ name: "" });
      expect(errors.length).toBeGreaterThan(0);
    });

    test("validates description length when present", () => {
      const errors = validatePartialProject({ description: "x".repeat(501) });
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
