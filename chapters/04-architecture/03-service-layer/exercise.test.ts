import { describe, test, expect, beforeEach } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { ProjectService } = await import(MODULE);

let service: InstanceType<typeof ProjectService>;

beforeEach(() => {
  service = new ProjectService();
});

describe("Service Layer", () => {
  describe("create", () => {
    test("creates project with auto-generated id and createdAt", () => {
      const project = service.create({ name: "Test", description: "Desc", ownerId: "u1", status: "active" as const });
      expect(project.id).toBeDefined();
      expect(project.name).toBe("Test");
      expect(project.createdAt).toBeInstanceOf(Date);
    });

    test("generates unique ids", () => {
      const p1 = service.create({ name: "A", description: "", ownerId: "u1", status: "active" as const });
      const p2 = service.create({ name: "B", description: "", ownerId: "u1", status: "active" as const });
      expect(p1.id).not.toBe(p2.id);
    });
  });

  describe("findById", () => {
    test("returns project by id", () => {
      const created = service.create({ name: "Test", description: "", ownerId: "u1", status: "active" as const });
      const found = service.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Test");
    });

    test("returns null for missing id", () => {
      expect(service.findById("nonexistent")).toBeNull();
    });
  });

  describe("findAll", () => {
    test("returns paginated result", () => {
      for (let i = 0; i < 15; i++) {
        service.create({ name: `Project ${i}`, description: "", ownerId: "u1", status: "active" as const });
      }
      const result = service.findAll({ page: 1, limit: 10 });
      expect(result.data.length).toBe(10);
      expect(result.total).toBe(15);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
    });

    test("returns second page", () => {
      for (let i = 0; i < 15; i++) {
        service.create({ name: `Project ${i}`, description: "", ownerId: "u1", status: "active" as const });
      }
      const result = service.findAll({ page: 2, limit: 10 });
      expect(result.data.length).toBe(5);
      expect(result.page).toBe(2);
    });

    test("defaults to page 1, limit 10", () => {
      for (let i = 0; i < 5; i++) {
        service.create({ name: `P${i}`, description: "", ownerId: "u1", status: "active" as const });
      }
      const result = service.findAll();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.data.length).toBe(5);
    });
  });

  describe("update", () => {
    test("updates project fields", () => {
      const created = service.create({ name: "Old", description: "Old desc", ownerId: "u1", status: "active" as const });
      const updated = service.update(created.id, { name: "New" });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("New");
      expect(updated!.description).toBe("Old desc");
    });

    test("returns null for missing id", () => {
      expect(service.update("missing", { name: "X" })).toBeNull();
    });
  });

  describe("delete", () => {
    test("deletes existing project", () => {
      const created = service.create({ name: "Del", description: "", ownerId: "u1", status: "active" as const });
      expect(service.delete(created.id)).toBe(true);
      expect(service.findById(created.id)).toBeNull();
    });

    test("returns false for missing id", () => {
      expect(service.delete("missing")).toBe(false);
    });
  });

  describe("search", () => {
    test("finds projects by name (case-insensitive)", () => {
      service.create({ name: "Alpha Project", description: "", ownerId: "u1", status: "active" as const });
      service.create({ name: "Beta Project", description: "", ownerId: "u1", status: "active" as const });
      service.create({ name: "Something Else", description: "", ownerId: "u1", status: "active" as const });
      const results = service.search("alpha");
      expect(results.length).toBe(1);
      expect(results[0].name).toBe("Alpha Project");
    });

    test("returns empty array for no matches", () => {
      service.create({ name: "Test", description: "", ownerId: "u1", status: "active" as const });
      expect(service.search("nonexistent")).toEqual([]);
    });
  });
});
