/**
 * Chapter 7.1 - PostgreSQL Basics
 *
 * Learn Bun.sql fundamentals with CRUD operations.
 * Prerequisites: docker compose up -d
 */
import { SQL } from "bun";

// TODO: Create a database connection using Bun.sql
// Returns an SQL instance connected to the given URL
export function createConnection(url: string) {
  throw new Error("Not implemented");
}

// TODO: Create the projects table
// Columns: id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid()),
//          name (VARCHAR(100), NOT NULL),
//          description (TEXT, DEFAULT ''),
//          owner_id (VARCHAR(50), NOT NULL),
//          status (VARCHAR(20), DEFAULT 'active'),
//          created_at (TIMESTAMPTZ, DEFAULT NOW())
export async function createTable(sql: InstanceType<typeof SQL>): Promise<void> {
  throw new Error("Not implemented");
}

// TODO: Insert a project and return it (use RETURNING *)
export async function insertProject(sql: InstanceType<typeof SQL>, input: {
  name: string;
  description: string;
  owner_id: string;
  status: string;
}): Promise<any> {
  throw new Error("Not implemented");
}

// TODO: Get a project by ID, return null if not found
export async function getProjectById(sql: InstanceType<typeof SQL>, id: string): Promise<any | null> {
  throw new Error("Not implemented");
}

// TODO: Get all projects
export async function getAllProjects(sql: InstanceType<typeof SQL>): Promise<any[]> {
  throw new Error("Not implemented");
}

// TODO: Delete a project by ID, return true if deleted, false if not found
export async function deleteProject(sql: InstanceType<typeof SQL>, id: string): Promise<boolean> {
  throw new Error("Not implemented");
}
