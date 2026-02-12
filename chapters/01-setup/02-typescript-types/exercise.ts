/**
 * Chapter 1.2 - TypeScript Types
 *
 * Define the domain model types for the Task Manager API.
 */

// TODO: Define the Project interface
// Fields: id (string), name (string), description (string), ownerId (string),
//         status ("active" | "archived"), createdAt (Date)
export interface Project {
  // Add fields here
}

// TODO: Define the Task interface
// Fields: id (string), projectId (string), title (string), description (string),
//         assigneeId (string | null), status ("todo" | "in_progress" | "done"),
//         priority ("low" | "medium" | "high"), dueDate (Date | null), createdAt (Date)
export interface Task {
  // Add fields here
}

// TODO: Define the User interface
// Fields: id (string), username (string), email (string), passwordHash (string),
//         role ("admin" | "member"), createdAt (Date)
export interface User {
  // Add fields here
}

// TODO: Define the Comment interface
// Fields: id (string), taskId (string), userId (string), content (string), createdAt (Date)
export interface Comment {
  // Add fields here
}

// TODO: Create CreateProjectInput type using Omit<Project, "id" | "createdAt">
export type CreateProjectInput = {};

// TODO: Create CreateTaskInput type using Omit<Task, "id" | "createdAt">
export type CreateTaskInput = {};

// TODO: Implement isValidProject type guard
// Should check that obj is a non-null object with all required Project fields
// and correct types (string for id/name/description/ownerId,
// "active" or "archived" for status, Date instance for createdAt)
export function isValidProject(obj: unknown): obj is Project {
  throw new Error("Not implemented");
}

// TODO: Implement createTaskInput factory function
// Returns a CreateTaskInput with defaults:
//   title: "", description: "", projectId: "", assigneeId: null,
//   status: "todo", priority: "medium", dueDate: null
// Overrides should replace defaults
export function createTaskInput(
  overrides?: Partial<CreateTaskInput>,
): CreateTaskInput {
  throw new Error("Not implemented");
}
