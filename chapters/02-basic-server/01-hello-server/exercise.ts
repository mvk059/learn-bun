/**
 * Chapter 2.1 - Hello Server
 *
 * Create your first HTTP server with Bun.serve()!
 */

// Create an HTTP server that:
// - Listens on the given port
// - Responds to ALL requests with "Hello from Task Manager API!"
// - Returns the server instance
//
// Use Bun.serve() with a fetch handler
// The fetch handler receives a Request and must return a Response
export function createServer(port: number) {
  return Bun.serve({
    port: port,
    fetch(req) {
      return new Response("Hello from Task Manager API!", { status: 200 })
    }
  })

}
