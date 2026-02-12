/**
 * Chapter 9.3 - Rate Limiting Middleware
 */

// TODO: Implement createRateLimitedServer({ port, maxRequests, windowSeconds })
// Server that applies rate limiting to all requests:
// - Track requests per client IP (use request headers or default "127.0.0.1")
// - Add headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
// - When limit exceeded: 429 { error: "Too Many Requests" } with Retry-After header
// - Normal requests: 200 { message: "OK" }
// Returns { server, stop() }
export function createRateLimitedServer(options: {
  port: number;
  maxRequests: number;
  windowSeconds: number;
}): { server: ReturnType<typeof Bun.serve>; stop: () => void } {
  throw new Error("Not implemented");
}
