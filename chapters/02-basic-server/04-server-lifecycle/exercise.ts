/**
 * Chapter 2.4 - Server Lifecycle
 *
 * Build a server factory with health checks and graceful shutdown.
 */

// TODO: Define ServerOptions type
// Fields:
//   port: number
//   onStart?: (url: string) => void
export type ServerOptions = {
  port: number;
  onStart?: (url: string) => void;
};

// TODO: Implement createTaskManagerServer
// 1. Create a Bun server on options.port
// 2. In the fetch handler:
//    - GET /health -> Response.json({ status: "ok", timestamp: new Date().toISOString() })
//    - Everything else -> Response.json({ error: "Not Found" }, { status: 404 })
// 3. After creating the server, call options.onStart?.(url) with the server URL
// 4. Return { server, stop } where stop() calls server.stop(true)
export function createTaskManagerServer(options: ServerOptions): {
  server: ReturnType<typeof Bun.serve>;
  stop: () => void;
} {
  throw new Error("Not implemented");
}
