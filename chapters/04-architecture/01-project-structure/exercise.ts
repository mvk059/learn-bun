/**
 * Chapter 4.1 - Project Structure
 *
 * Organize code with constants, barrel exports, and an app factory.
 */

// TODO: Define HTTP_STATUS object with common HTTP status codes
// OK: 200, CREATED: 201, NO_CONTENT: 204, BAD_REQUEST: 400,
// UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
// METHOD_NOT_ALLOWED: 405, CONFLICT: 409, INTERNAL_SERVER_ERROR: 500
export const HTTP_STATUS = {} as Record<string, number>;

// TODO: Define pagination constants
export const DEFAULT_PAGE_SIZE = 0; // Should be 10
export const MAX_PAGE_SIZE = 0; // Should be 100

// TODO: Implement createApp factory
// Takes { port: number } and returns { server, stop() }
// Should have GET /health returning { status: "ok" }
// All other routes return 404 { error: "Not Found" }
export function createApp(options: { port: number }): {
  server: ReturnType<typeof Bun.serve>;
  stop: () => void;
} {
  throw new Error("Not implemented");
}
