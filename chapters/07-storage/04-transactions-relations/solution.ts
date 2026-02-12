/**
 * Chapter 7.4 - Transactions & Relations (Solution)
 */
import { SQL } from "bun";

export class TaskRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async create(input: any): Promise<any> {
    const rows = await this.sql`
      INSERT INTO tasks (project_id, title, description, assignee_id, status, priority, due_date)
      VALUES (${input.project_id}, ${input.title}, ${input.description ?? ""}, ${input.assignee_id ?? null}, ${input.status}, ${input.priority}, ${input.due_date ?? null})
      RETURNING *
    `;
    return rows[0];
  }

  async findByProjectId(projectId: string): Promise<any[]> {
    const rows = await this.sql`SELECT * FROM tasks WHERE project_id = ${projectId} ORDER BY created_at ASC`;
    return [...rows];
  }

  async findByAssigneeId(assigneeId: string): Promise<any[]> {
    const rows = await this.sql`SELECT * FROM tasks WHERE assignee_id = ${assigneeId} ORDER BY created_at ASC`;
    return [...rows];
  }

  async updateStatus(id: string, status: string): Promise<any | null> {
    const rows = await this.sql`UPDATE tasks SET status = ${status} WHERE id = ${id} RETURNING *`;
    return rows[0] ?? null;
  }
}

export class CommentRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async create(input: { task_id: string; user_id: string; content: string }): Promise<any> {
    const rows = await this.sql`
      INSERT INTO comments (task_id, user_id, content)
      VALUES (${input.task_id}, ${input.user_id}, ${input.content})
      RETURNING *
    `;
    return rows[0];
  }

  async findByTaskId(taskId: string): Promise<any[]> {
    const rows = await this.sql`SELECT * FROM comments WHERE task_id = ${taskId} ORDER BY created_at ASC`;
    return [...rows];
  }
}

export async function seedDatabase(sql: InstanceType<typeof SQL>): Promise<void> {
  await sql.begin(async (tx) => {
    const [user] = await tx`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@example.com', 'hashed_password', 'admin')
      RETURNING *
    `;

    const [project1] = await tx`
      INSERT INTO projects (name, description, owner_id)
      VALUES ('Project Alpha', 'First project', ${user.id})
      RETURNING *
    `;

    const [project2] = await tx`
      INSERT INTO projects (name, description, owner_id)
      VALUES ('Project Beta', 'Second project', ${user.id})
      RETURNING *
    `;

    await tx`INSERT INTO tasks (project_id, title, status, priority) VALUES (${project1.id}, 'Setup environment', 'done', 'high')`;
    await tx`INSERT INTO tasks (project_id, title, status, priority) VALUES (${project1.id}, 'Build API', 'in_progress', 'high')`;
    await tx`INSERT INTO tasks (project_id, title, status, priority) VALUES (${project2.id}, 'Write docs', 'todo', 'medium')`;
  });
}

export async function getProjectWithTasks(sql: InstanceType<typeof SQL>, projectId: string): Promise<any | null> {
  const projects = await sql`SELECT * FROM projects WHERE id = ${projectId}`;
  if (projects.length === 0) return null;

  const project = projects[0];
  const tasks = await sql`SELECT * FROM tasks WHERE project_id = ${projectId} ORDER BY created_at ASC`;

  return { ...project, tasks: [...tasks] };
}
