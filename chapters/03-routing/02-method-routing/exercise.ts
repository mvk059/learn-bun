/**
 * Chapter 3.2 - Method Routing
 *
 * Route requests based on HTTP method with an in-memory data store.
 */

interface Project {
  id: string;
  name: string;
  description: string;
}

// TODO: Implement createServer
// Create a server with an in-memory projects array and these routes:
//
// GET  /api/projects → Response.json(projects) with status 200
// POST /api/projects → parse body with req.json(), add project with generated id,
//                      return Response.json(project, { status: 201 })
// Other methods on /api/projects → Response.json({ error: "Method Not Allowed" }, { status: 405 })
// All other paths → Response.json({ error: "Not Found" }, { status: 404 })
//
// For POST, generate an id using crypto.randomUUID() or a simple counter
export function createServer(port: number) {
  throw new Error("Not implemented");
}
