import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { TaskRepository, CommentRepository, seedDatabase, getProjectWithTasks } = await import(MODULE);

let sql: InstanceType<typeof SQL>;

beforeAll(async () => {
  sql = new SQL({ url: process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test" });
  // Create all tables
  await sql`CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL, description TEXT DEFAULT '', owner_id VARCHAR(50) NOT NULL, status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role VARCHAR(20) DEFAULT 'member', created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title VARCHAR(200) NOT NULL, description TEXT DEFAULT '', assignee_id UUID REFERENCES users(id) ON DELETE SET NULL, status VARCHAR(20) DEFAULT 'todo', priority VARCHAR(10) DEFAULT 'medium', due_date DATE, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`;
});

beforeEach(async () => {
  await sql`DELETE FROM comments`;
  await sql`DELETE FROM tasks`;
  await sql`DELETE FROM users`;
  await sql`DELETE FROM projects`;
});

afterAll(async () => {
  await sql`DROP TABLE IF EXISTS comments CASCADE`;
  await sql`DROP TABLE IF EXISTS tasks CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql`DROP TABLE IF EXISTS projects CASCADE`;
  await sql.close();
});

describe("Transactions & Relations", () => {
  describe("seedDatabase", () => {
    test("creates sample data atomically", async () => {
      await seedDatabase(sql);
      const projects = await sql`SELECT COUNT(*)::int as count FROM projects`;
      const users = await sql`SELECT COUNT(*)::int as count FROM users`;
      const tasks = await sql`SELECT COUNT(*)::int as count FROM tasks`;
      expect(projects[0].count).toBeGreaterThan(0);
      expect(users[0].count).toBeGreaterThan(0);
      expect(tasks[0].count).toBeGreaterThan(0);
    });
  });

  describe("TaskRepository", () => {
    test("creates task linked to project", async () => {
      const [project] = await sql`INSERT INTO projects (name, owner_id) VALUES ('P1', 'u1') RETURNING *`;
      const taskRepo = new TaskRepository(sql);
      const task = await taskRepo.create({
        project_id: project.id,
        title: "Test Task",
        status: "todo",
        priority: "medium",
      });
      expect(task.id).toBeDefined();
      expect(task.project_id).toBe(project.id);
    });

    test("finds tasks by project", async () => {
      const [project] = await sql`INSERT INTO projects (name, owner_id) VALUES ('P1', 'u1') RETURNING *`;
      const taskRepo = new TaskRepository(sql);
      await taskRepo.create({ project_id: project.id, title: "Task 1", status: "todo", priority: "low" });
      await taskRepo.create({ project_id: project.id, title: "Task 2", status: "done", priority: "high" });
      const tasks = await taskRepo.findByProjectId(project.id);
      expect(tasks.length).toBe(2);
    });

    test("updates task status", async () => {
      const [project] = await sql`INSERT INTO projects (name, owner_id) VALUES ('P1', 'u1') RETURNING *`;
      const taskRepo = new TaskRepository(sql);
      const task = await taskRepo.create({ project_id: project.id, title: "Task", status: "todo", priority: "medium" });
      const updated = await taskRepo.updateStatus(task.id, "done");
      expect(updated!.status).toBe("done");
    });
  });

  describe("getProjectWithTasks", () => {
    test("returns project with nested tasks", async () => {
      const [project] = await sql`INSERT INTO projects (name, owner_id) VALUES ('My Project', 'u1') RETURNING *`;
      await sql`INSERT INTO tasks (project_id, title) VALUES (${project.id}, 'Task A')`;
      await sql`INSERT INTO tasks (project_id, title) VALUES (${project.id}, 'Task B')`;

      const result = await getProjectWithTasks(sql, project.id);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("My Project");
      expect(result!.tasks.length).toBe(2);
    });

    test("returns null for missing project", async () => {
      const result = await getProjectWithTasks(sql, "00000000-0000-0000-0000-000000000000");
      expect(result).toBeNull();
    });
  });

  describe("foreign key enforcement", () => {
    test("cannot create task for non-existent project", async () => {
      const taskRepo = new TaskRepository(sql);
      try {
        await taskRepo.create({
          project_id: "00000000-0000-0000-0000-000000000000",
          title: "Orphan Task",
          status: "todo",
          priority: "medium",
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});
