/**
 * Chapter 11.1 - Health Check & Graceful Shutdown
 */

// TODO: Implement createHealthyServer({ port })
// Routes:
// GET /health -> { status: "ok", uptime: seconds since start, timestamp: ISO string }
// GET /ready -> { status: "ready" }
// All other routes -> 404
//
// Return { server, stop() } where stop() gracefully shuts down
export function createHealthyServer(options: { port: number }): {
  server: ReturnType<typeof Bun.serve>;
  stop: () => void;
} {
  throw new Error("Not implemented");
}
