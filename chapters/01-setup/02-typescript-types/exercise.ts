/**
 * Chapter 1.2 - TypeScript Types
 *
 * Define the domain model types for the Task Manager API.
 */

// Fields: id (string), name (string), description (string), ownerId (string),
//         status ("active" | "archived"), createdAt (Date)
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: "active" | "archived";
  createdAt: Date;
}

// Fields: id (string), projectId (string), title (string), description (string),
//         assigneeId (string | null), status ("todo" | "in_progress" | "done"),
//         priority ("low" | "medium" | "high"), dueDate (Date | null), createdAt (Date)
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

// Fields: id (string), username (string), email (string), passwordHash (string),
//         role ("admin" | "member"), createdAt (Date)
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "admin" | "member";
  createdAt: Date;
}

// Fields: id (string), taskId (string), userId (string), content (string), createdAt (Date)
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export type CreateProjectInput = Omit<Project, "id" | "createdAt">;

export type CreateTaskInput = Omit<Task, "id" | "createdAt">;

// Should check that obj is a non-null object with all required Project fields
// and correct types (string for id/name/description/ownerId,
// "active" or "archived" for status, Date instance for createdAt)
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

// Returns a CreateTaskInput with defaults:
//   title: "", description: "", projectId: "", assigneeId: null,
//   status: "todo", priority: "medium", dueDate: null
// Overrides should replace defaults
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
