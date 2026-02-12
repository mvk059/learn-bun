import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { ProjectRepository } = await import(MODULE);

let sql: InstanceType<typeof SQL>;
let repo: InstanceType<typeof ProjectRepository>;

beforeAll(async () => {
  sql = new SQL({ url: process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test" });
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT DEFAULT '',
      owner_id VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  repo = new ProjectRepository(sql);
});

beforeEach(async () => {
  await sql`DELETE FROM projects`;
});

afterAll(async () => {
  await sql`DROP TABLE IF EXISTS projects CASCADE`;
  await sql.close();
});

describe("Repository Pattern", () => {
  describe("create", () => {
    test("creates and returns project", async () => {
      const project = await repo.create({
        name: "Test Project",
        description: "A test",
        owner_id: "user1",
        status: "active",
      });
      expect(project.id).toBeDefined();
      expect(project.name).toBe("Test Project");
    });
  });

  describe("findById", () => {
    test("finds existing project", async () => {
      const created = await repo.create({ name: "Find Me", description: "", owner_id: "u1", status: "active" });
      const found = await repo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Find Me");
    });

    test("returns null for missing", async () => {
      const found = await repo.findById("00000000-0000-0000-0000-000000000000");
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    test("returns paginated results with correct totals", async () => {
      for (let i = 0; i < 15; i++) {
        await repo.create({ name: `Project ${i}`, description: "", owner_id: "u1", status: "active" });
      }
      const result = await repo.findAll({ page: 1, limit: 10 });
      expect(result.data.length).toBe(10);
      expect(result.total).toBe(15);
      expect(result.totalPages).toBe(2);
    });

    test("returns second page", async () => {
      for (let i = 0; i < 15; i++) {
        await repo.create({ name: `Project ${i}`, description: "", owner_id: "u1", status: "active" });
      }
      const result = await repo.findAll({ page: 2, limit: 10 });
      expect(result.data.length).toBe(5);
    });

    test("supports search by name", async () => {
      await repo.create({ name: "Alpha Project", description: "", owner_id: "u1", status: "active" });
      await repo.create({ name: "Beta Project", description: "", owner_id: "u1", status: "active" });
      await repo.create({ name: "Something Else", description: "", owner_id: "u1", status: "active" });

      const result = await repo.findAll({ page: 1, limit: 10, search: "alpha" });
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe("Alpha Project");
      expect(result.total).toBe(1);
    });
  });

  describe("update", () => {
    test("updates project fields", async () => {
      const created = await repo.create({ name: "Old", description: "Old desc", owner_id: "u1", status: "active" });
      const updated = await repo.update(created.id, { name: "New Name" });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("New Name");
      expect(updated!.description).toBe("Old desc");
    });

    test("returns null for missing", async () => {
      const result = await repo.update("00000000-0000-0000-0000-000000000000", { name: "X" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("deletes existing project", async () => {
      const created = await repo.create({ name: "Delete Me", description: "", owner_id: "u1", status: "active" });
      const deleted = await repo.delete(created.id);
      expect(deleted).toBe(true);
      const found = await repo.findById(created.id);
      expect(found).toBeNull();
    });

    test("returns false for missing", async () => {
      expect(await repo.delete("00000000-0000-0000-0000-000000000000")).toBe(false);
    });
  });
});
