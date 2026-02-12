/**
 * Chapter 7.2 - Schema & Migrations (Solution)
 */
import { SQL } from "bun";

export interface Migration {
  version: number;
  name: string;
  up: (sql: InstanceType<typeof SQL>) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: "create_projects",
    up: async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT DEFAULT '',
          owner_id VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
    },
  },
  {
    version: 2,
    name: "create_users",
    up: async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
    },
  },
  {
    version: 3,
    name: "create_tasks",
    up: async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          title VARCHAR(200) NOT NULL,
          description TEXT DEFAULT '',
          assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
          status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
          priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          due_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
    },
  },
  {
    version: 4,
    name: "create_comments",
    up: async (sql) => {
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
    },
  },
];

export async function getCurrentVersion(sql: InstanceType<typeof SQL>): Promise<number> {
  try {
    const rows = await sql`
      SELECT COALESCE(MAX(version), 0) as version FROM _migrations
    `;
    return rows[0].version;
  } catch {
    return 0;
  }
}

export async function runMigrations(sql: InstanceType<typeof SQL>, migrationList: Migration[]): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  const currentVersion = await getCurrentVersion(sql);

  const pending = migrationList
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await migration.up(sql);
    await sql`
      INSERT INTO _migrations (version, name) VALUES (${migration.version}, ${migration.name})
    `;
  }
}
