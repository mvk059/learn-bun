/**
 * Chapter 5.3 - Validation (Solution)
 */

export function validateProject(input: Record<string, any>): string[] {
  const errors: string[] = [];

  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (input.name.length > 100) {
    errors.push("Name must be 100 characters or less");
  }

  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description === "string" && input.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }
  }

  if (!input.ownerId || typeof input.ownerId !== "string") {
    errors.push("Owner ID is required");
  }

  if (input.status !== undefined && !["active", "archived"].includes(input.status)) {
    errors.push("Status must be 'active' or 'archived'");
  }

  return errors;
}

export function validateTask(input: Record<string, any>): string[] {
  const errors: string[] = [];

  if (!input.title || typeof input.title !== "string" || input.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!input.projectId || typeof input.projectId !== "string") {
    errors.push("Project ID is required");
  }

  const validStatuses = ["todo", "in_progress", "done"];
  if (input.status !== undefined && !validStatuses.includes(input.status)) {
    errors.push("Status must be one of: todo, in_progress, done");
  }

  const validPriorities = ["low", "medium", "high"];
  if (input.priority !== undefined && !validPriorities.includes(input.priority)) {
    errors.push("Priority must be one of: low, medium, high");
  }

  if (input.dueDate !== undefined && input.dueDate !== null) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof input.dueDate !== "string" || !dateRegex.test(input.dueDate) || isNaN(Date.parse(input.dueDate))) {
      errors.push("Due date must be a valid date in YYYY-MM-DD format");
    }
  }

  return errors;
}

export function validatePartialProject(input: Record<string, any>): string[] {
  const errors: string[] = [];

  if ("name" in input) {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      errors.push("Name must be a non-empty string");
    } else if (input.name.length > 100) {
      errors.push("Name must be 100 characters or less");
    }
  }

  if ("description" in input) {
    if (typeof input.description === "string" && input.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }
  }

  return errors;
}
