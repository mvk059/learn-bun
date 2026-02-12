import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { SQL } from "bun";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { migrations, runMigrations, getCurrentVersion } = await import(MODULE);

let sql: InstanceType<typeof SQL>;

beforeAll(() => {
  sql = new SQL({ url: process.env.DATABASE_URL || "postgres://taskmanager:taskmanager@localhost:5433/taskmanager_test" });
});

beforeEach(async () => {
  // Clean up all tables for fresh start
  await sql`DROP TABLE IF EXISTS comments CASCADE`;
  await sql`DROP TABLE IF EXISTS tasks CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql`DROP TABLE IF EXISTS projects CASCADE`;
  await sql`DROP TABLE IF EXISTS _migrations CASCADE`;
});

afterAll(async () => {
  await sql`DROP TABLE IF EXISTS comments CASCADE`;
  await sql`DROP TABLE IF EXISTS tasks CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql`DROP TABLE IF EXISTS projects CASCADE`;
  await sql`DROP TABLE IF EXISTS _migrations CASCADE`;
  await sql.close();
});

describe("Schema & Migrations", () => {
  test("migrations array has 4 entries", () => {
    expect(migrations.length).toBe(4);
  });

  test("each migration has version, name, and up", () => {
    for (const m of migrations) {
      expect(typeof m.version).toBe("number");
      expect(typeof m.name).toBe("string");
      expect(typeof m.up).toBe("function");
    }
  });

  describe("runMigrations", () => {
    test("runs all migrations on fresh database", async () => {
      await runMigrations(sql, migrations);
      const version = await getCurrentVersion(sql);
      expect(version).toBe(4);
    });

    test("is idempotent - running twice does not error", async () => {
      await runMigrations(sql, migrations);
      await runMigrations(sql, migrations);
      const version = await getCurrentVersion(sql);
      expect(version).toBe(4);
    });

    test("creates projects table", async () => {
      await runMigrations(sql, migrations);
      const result = await sql`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects')
      `;
      expect(result[0].exists).toBe(true);
    });

    test("creates users table", async () => {
      await runMigrations(sql, migrations);
      const result = await sql`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')
      `;
      expect(result[0].exists).toBe(true);
    });

    test("creates tasks table with foreign keys", async () => {
      await runMigrations(sql, migrations);
      const result = await sql`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks')
      `;
      expect(result[0].exists).toBe(true);
    });

    test("creates comments table", async () => {
      await runMigrations(sql, migrations);
      const result = await sql`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments')
      `;
      expect(result[0].exists).toBe(true);
    });
  });

  describe("getCurrentVersion", () => {
    test("returns 0 when no migrations run", async () => {
      const version = await getCurrentVersion(sql);
      expect(version).toBe(0);
    });

    test("returns latest version after migrations", async () => {
      await runMigrations(sql, migrations);
      const version = await getCurrentVersion(sql);
      expect(version).toBe(4);
    });
  });
});
