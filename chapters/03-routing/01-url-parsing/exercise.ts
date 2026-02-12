/**
 * Chapter 3.1 - URL Parsing
 *
 * Pure functions for URL manipulation using the Web Standard URL API.
 */

// TODO: Extract pathname from a full URL string
// Example: "http://localhost:3000/api/projects?page=1" → "/api/projects"
export function parsePath(url: string): string {
  throw new Error("Not implemented");
}

// TODO: Split the URL pathname into segments, filtering empty strings
// Example: "http://localhost:3000/api/projects/123" → ["api", "projects", "123"]
// Root "/" → []
export function parseSegments(url: string): string[] {
  throw new Error("Not implemented");
}

// TODO: Extract all query parameters as a key-value object
// Example: "http://localhost:3000/api?page=1&limit=10" → { page: "1", limit: "10" }
// No query params → {}
export function parseQueryParams(url: string): Record<string, string> {
  throw new Error("Not implemented");
}

// TODO: Build a full URL from base, path, and optional query params
// Example: buildUrl("http://localhost:3000", "/api/tasks", { page: "1" })
//   → "http://localhost:3000/api/tasks?page=1"
export function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  throw new Error("Not implemented");
}
