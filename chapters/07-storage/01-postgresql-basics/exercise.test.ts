import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createConnection, createTable, insertProject, getProjectById, getAllProjects, deleteProject } = await import(MODULE);

let sql: InstanceType<typeof SQL>;

beforeAll(async () => {
  sql = createConnection(process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test");
  await createTable(sql);
});

beforeEach(async () => {
  await sql`DELETE FROM projects`;
});

afterAll(async () => {
  await sql`DROP TABLE IF EXISTS projects`;
  await sql.close();
});

describe("PostgreSQL Basics", () => {
  describe("createTable", () => {
    test("projects table exists", async () => {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables WHERE table_name = 'projects'
        )
      `;
      expect(result[0].exists).toBe(true);
    });
  });

  describe("insertProject", () => {
    test("inserts and returns project with id", async () => {
      const project = await insertProject(sql, {
        name: "Test Project",
        description: "A test",
        owner_id: "user1",
        status: "active",
      });
      expect(project.id).toBeDefined();
      expect(project.name).toBe("Test Project");
      expect(project.created_at).toBeDefined();
    });
  });

  describe("getProjectById", () => {
    test("retrieves project by id", async () => {
      const created = await insertProject(sql, {
        name: "Find Me",
        description: "Desc",
        owner_id: "user1",
        status: "active",
      });
      const found = await getProjectById(sql, created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Find Me");
    });

    test("returns null for non-existent id", async () => {
      const found = await getProjectById(sql, "00000000-0000-0000-0000-000000000000");
      expect(found).toBeNull();
    });
  });

  describe("getAllProjects", () => {
    test("returns all projects", async () => {
      await insertProject(sql, { name: "P1", description: "", owner_id: "u1", status: "active" });
      await insertProject(sql, { name: "P2", description: "", owner_id: "u1", status: "active" });
      const all = await getAllProjects(sql);
      expect(all.length).toBe(2);
    });

    test("returns empty array when no projects", async () => {
      const all = await getAllProjects(sql);
      expect(all).toEqual([]);
    });
  });

  describe("deleteProject", () => {
    test("deletes existing project", async () => {
      const created = await insertProject(sql, { name: "Del", description: "", owner_id: "u1", status: "active" });
      const deleted = await deleteProject(sql, created.id);
      expect(deleted).toBe(true);
      const found = await getProjectById(sql, created.id);
      expect(found).toBeNull();
    });

    test("returns false for non-existent id", async () => {
      const deleted = await deleteProject(sql, "00000000-0000-0000-0000-000000000000");
      expect(deleted).toBe(false);
    });
  });
});
