/**
 * Chapter 7.4 - Transactions & Relations
 *
 * Data integrity with transactions and foreign key relationships.
 */
import { SQL } from "bun";

// TODO: Implement TaskRepository
// Constructor takes sql instance
// Methods:
// - create(input: { project_id, title, status, priority, description?, assignee_id?, due_date? }): Promise<any>
// - findByProjectId(projectId: string): Promise<any[]>
// - findByAssigneeId(assigneeId: string): Promise<any[]>
// - updateStatus(id: string, status: string): Promise<any | null>
export class TaskRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async create(input: any): Promise<any> {
    throw new Error("Not implemented");
  }

  async findByProjectId(projectId: string): Promise<any[]> {
    throw new Error("Not implemented");
  }

  async findByAssigneeId(assigneeId: string): Promise<any[]> {
    throw new Error("Not implemented");
  }

  async updateStatus(id: string, status: string): Promise<any | null> {
    throw new Error("Not implemented");
  }
}

// TODO: Implement CommentRepository
export class CommentRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async create(input: { task_id: string; user_id: string; content: string }): Promise<any> {
    throw new Error("Not implemented");
  }

  async findByTaskId(taskId: string): Promise<any[]> {
    throw new Error("Not implemented");
  }
}

// TODO: Implement seedDatabase using sql.begin() for transactional seeding
// Creates sample: 1 user, 2 projects, 3 tasks across projects
export async function seedDatabase(sql: InstanceType<typeof SQL>): Promise<void> {
  throw new Error("Not implemented");
}

// TODO: Implement getProjectWithTasks
// Returns project with a `tasks` array property, or null if project not found
// Use a JOIN or separate queries
export async function getProjectWithTasks(sql: InstanceType<typeof SQL>, projectId: string): Promise<any | null> {
  throw new Error("Not implemented");
}
