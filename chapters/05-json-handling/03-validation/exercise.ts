/**
 * Chapter 5.3 - Validation
 *
 * Input validation functions for the Task Manager API.
 */

// TODO: Implement validateProject
// Validates a project creation input. Returns array of error message strings.
// Rules:
// - name: required, must be 1-100 characters
// - description: optional, max 500 characters if provided
// - ownerId: required
// - status: must be "active" or "archived" if provided
export function validateProject(input: Record<string, any>): string[] {
  throw new Error("Not implemented");
}

// TODO: Implement validateTask
// Validates a task creation input. Returns array of error messages.
// Rules:
// - title: required, non-empty string
// - projectId: required
// - status: must be one of "todo", "in_progress", "done"
// - priority: must be one of "low", "medium", "high"
// - dueDate: if provided, must be valid date string (YYYY-MM-DD format)
export function validateTask(input: Record<string, any>): string[] {
  throw new Error("Not implemented");
}

// TODO: Implement validatePartialProject
// For PATCH/PUT updates. Only validates fields that are present.
// Empty object is valid. But if name is provided, it must be 1-100 chars.
// If description is provided, max 500 chars.
export function validatePartialProject(input: Record<string, any>): string[] {
  throw new Error("Not implemented");
}
