/**
 * Chapter 7.2 - Schema & Migrations
 *
 * Database structure management with a migration system.
 */
import { SQL } from "bun";

export interface Migration {
  version: number;
  name: string;
  up: (sql: InstanceType<typeof SQL>) => Promise<void>;
}

// TODO: Define 4 migrations:
// v1: Create projects table (id UUID PK, name, description, owner_id, status, created_at)
// v2: Create users table (id UUID PK, username UNIQUE, email UNIQUE, password_hash, role, created_at)
// v3: Create tasks table (id UUID PK, project_id FK->projects, title, description,
//     assignee_id FK->users nullable, status, priority, due_date nullable, created_at)
// v4: Create comments table (id UUID PK, task_id FK->tasks, user_id FK->users,
//     content TEXT NOT NULL, created_at)
export const migrations: Migration[] = [
  // Add your migrations here
];

// TODO: Implement getCurrentVersion
// Check the _migrations table for the highest version number
// If _migrations table doesn't exist, return 0
export async function getCurrentVersion(sql: InstanceType<typeof SQL>): Promise<number> {
  throw new Error("Not implemented");
}

// TODO: Implement runMigrations
// 1. Create _migrations table if not exists (version INT, name TEXT, applied_at TIMESTAMPTZ)
// 2. Get current version
// 3. Run only migrations with version > currentVersion
// 4. After each migration, insert record into _migrations
export async function runMigrations(sql: InstanceType<typeof SQL>, migrationList: Migration[]): Promise<void> {
  throw new Error("Not implemented");
}
