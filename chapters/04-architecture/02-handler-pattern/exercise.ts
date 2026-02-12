/**
 * Chapter 4.2 - Handler Pattern
 *
 * Request handlers as standalone functions.
 */

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

// TODO: Implement listProjectsHandler
// Returns all projects as JSON (200). Supports pagination query params (page, limit).
// Use URL to parse query params, slice array for pagination.
export async function listProjectsHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  throw new Error("Not implemented");
}

// TODO: Implement getProjectHandler
// Find project by params.id. Return 200 with project or 404 { error: "Not Found" }
export async function getProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  throw new Error("Not implemented");
}

// TODO: Implement createProjectHandler
// Parse JSON body, validate name exists, create project with id (crypto.randomUUID()),
// status "active", createdAt (ISO string). Push to array. Return 201.
// If name missing, return 400 { error: "Name is required" }
export async function createProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  throw new Error("Not implemented");
}

// TODO: Implement deleteProjectHandler
// Find project by params.id. If found, remove from array and return 204 (no body).
// If not found, return 404 { error: "Not Found" }
export async function deleteProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  throw new Error("Not implemented");
}
