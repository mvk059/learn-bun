/**
 * Chapter 6.4 - Not Found & Method Not Allowed
 *
 * Proper HTTP semantics with Allow headers.
 */

// TODO: Implement createServer(port)
// Create a server with these routes:
// GET  /api/projects     -> 200 Response.json([])
// POST /api/projects     -> 201 Response.json({ name: parsed body name })
// GET  /api/projects/:id -> 200 Response.json({ id })
// PUT  /api/projects/:id -> 200 Response.json({ id, updated: true })
// DELETE /api/projects/:id -> 204
//
// For unmatched paths -> 404 JSON { error: "Not Found" }
// For matched path but wrong method -> 405 JSON { error: "Method Not Allowed" }
//   with Allow header listing the valid methods (comma-separated)
//
// Hint: Track which methods are registered for each path pattern,
// so you can return the Allow header on 405
export function createServer(port: number) {
  throw new Error("Not implemented");
}
