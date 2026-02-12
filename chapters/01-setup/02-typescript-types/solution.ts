/**
 * Chapter 1.2 - TypeScript Types (Solution)
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: "active" | "archived";
  createdAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: Date | null;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "admin" | "member";
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export type CreateProjectInput = Omit<Project, "id" | "createdAt">;
export type CreateTaskInput = Omit<Task, "id" | "createdAt">;

export function isValidProject(obj: unknown): obj is Project {
  if (obj === null || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.description === "string" &&
    typeof o.ownerId === "string" &&
    (o.status === "active" || o.status === "archived") &&
    o.createdAt instanceof Date
  );
}

export function createTaskInput(
  overrides?: Partial<CreateTaskInput>,
): CreateTaskInput {
  return {
    title: "",
    description: "",
    projectId: "",
    assigneeId: null,
    status: "todo",
    priority: "medium",
    dueDate: null,
    ...overrides,
  };
}
