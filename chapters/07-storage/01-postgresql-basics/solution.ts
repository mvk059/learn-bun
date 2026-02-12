/**
 * Chapter 7.1 - PostgreSQL Basics (Solution)
 */
import { SQL } from "bun";

export function createConnection(url: string) {
  return new SQL({ url });
}

export async function createTable(sql: InstanceType<typeof SQL>): Promise<void> {
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
}

export async function insertProject(sql: InstanceType<typeof SQL>, input: {
  name: string;
  description: string;
  owner_id: string;
  status: string;
}): Promise<any> {
  const rows = await sql`
    INSERT INTO projects (name, description, owner_id, status)
    VALUES (${input.name}, ${input.description}, ${input.owner_id}, ${input.status})
    RETURNING *
  `;
  return rows[0];
}

export async function getProjectById(sql: InstanceType<typeof SQL>, id: string): Promise<any | null> {
  const rows = await sql`SELECT * FROM projects WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function getAllProjects(sql: InstanceType<typeof SQL>): Promise<any[]> {
  const rows = await sql`SELECT * FROM projects ORDER BY created_at ASC`;
  return [...rows];
}

export async function deleteProject(sql: InstanceType<typeof SQL>, id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM projects WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
