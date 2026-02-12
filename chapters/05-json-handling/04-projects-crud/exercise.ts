/**
 * Chapter 5.4 - Projects CRUD Endpoints
 *
 * Wire together Router, Service, validation, and response helpers
 * for a complete CRUD API.
 */

// TODO: Implement createProjectsServer(port: number)
// Returns { server, stop }
//
// Routes:
// GET    /api/projects      -> List with pagination (page, limit query params)
//                             Response: { success: true, data: [...], meta: { total, page, limit, totalPages } }
// POST   /api/projects      -> Create (validate: name required, ownerId required)
//                             Success: 201 { success: true, data: project }
//                             Invalid: 400 { success: false, error: "..." }
// GET    /api/projects/:id  -> Get by ID
//                             Found: 200 { success: true, data: project }
//                             Not found: 404 { success: false, error: "Not Found" }
// PUT    /api/projects/:id  -> Update (partial, validates fields if present)
//                             Found: 200 { success: true, data: updatedProject }
//                             Not found: 404
// DELETE /api/projects/:id  -> Delete
//                             Found: 204 (no body)
//                             Not found: 404
//
// Use in-memory storage (Map or array)
// Generate id with crypto.randomUUID()
// Generate createdAt with new Date().toISOString()
export function createProjectsServer(port: number): {
  server: ReturnType<typeof Bun.serve>;
  stop: () => void;
} {
  throw new Error("Not implemented");
}
