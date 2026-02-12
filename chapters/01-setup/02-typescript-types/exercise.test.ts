import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const mod = await import(MODULE);
const { isValidProject, createTaskInput } = mod;

// Type-only checks: we verify the shape of exported types by creating objects
describe("TypeScript Types", () => {
  describe("Project interface", () => {
    test("valid project object has all required fields", () => {
      const project = {
        id: "p1",
        name: "My Project",
        description: "A test project",
        ownerId: "u1",
        status: "active" as const,
        createdAt: new Date(),
      };
      expect(isValidProject(project)).toBe(true);
    });

    test("rejects object missing required fields", () => {
      expect(isValidProject({ id: "p1", name: "Test" })).toBe(false);
    });

    test("rejects object with wrong status type", () => {
      const project = {
        id: "p1",
        name: "My Project",
        description: "A test project",
        ownerId: "u1",
        status: "invalid",
        createdAt: new Date(),
      };
      expect(isValidProject(project)).toBe(false);
    });

    test("rejects null", () => {
      expect(isValidProject(null)).toBe(false);
    });

    test("rejects non-object", () => {
      expect(isValidProject("string")).toBe(false);
    });

    test("rejects object with wrong field types", () => {
      const project = {
        id: 123,
        name: "My Project",
        description: "A test project",
        ownerId: "u1",
        status: "active",
        createdAt: new Date(),
      };
      expect(isValidProject(project)).toBe(false);
    });
  });

  describe("createTaskInput", () => {
    test("returns object with default values", () => {
      const input = createTaskInput();
      expect(input.title).toBe("");
      expect(input.description).toBe("");
      expect(input.projectId).toBe("");
      expect(input.assigneeId).toBeNull();
      expect(input.status).toBe("todo");
      expect(input.priority).toBe("medium");
      expect(input.dueDate).toBeNull();
    });

    test("overrides specified fields", () => {
      const input = createTaskInput({
        title: "My Task",
        priority: "high",
      });
      expect(input.title).toBe("My Task");
      expect(input.priority).toBe("high");
      expect(input.status).toBe("todo");
    });

    test("allows all fields to be overridden", () => {
      const dueDate = new Date("2025-12-31");
      const input = createTaskInput({
        title: "Full Task",
        description: "Desc",
        projectId: "p1",
        assigneeId: "u1",
        status: "in_progress",
        priority: "low",
        dueDate,
      });
      expect(input.title).toBe("Full Task");
      expect(input.assigneeId).toBe("u1");
      expect(input.status).toBe("in_progress");
      expect(input.dueDate).toEqual(dueDate);
    });
  });
});
