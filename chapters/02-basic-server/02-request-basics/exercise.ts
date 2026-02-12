/**
 * Chapter 2.2 - Request Basics
 *
 * Build an echo server that reflects request information back as JSON.
 */

// TODO: Implement createEchoServer
// Create a server that responds to every request with JSON containing:
// - method: the HTTP method (req.method)
// - url: the full URL string (req.url)
// - pathname: just the path portion (use new URL(req.url).pathname)
// - userAgent: User-Agent header or "Unknown" if not present
// - contentType: Content-Type header or null if not present
//
// Use Response.json() to send the JSON response
export function createEchoServer(port: number) {
  throw new Error("Not implemented");
}
