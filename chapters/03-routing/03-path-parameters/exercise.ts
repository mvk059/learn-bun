/**
 * Chapter 3.3 - Path Parameters
 *
 * Implement pattern matching for dynamic URL segments.
 */

// TODO: Implement matchPath
// Match a URL pathname against a pattern with :param segments.
//
// Algorithm:
// 1. Split both pattern and pathname by "/"
// 2. If segment counts differ → { matched: false, params: {} }
// 3. Compare each segment pair:
//    - If pattern segment starts with ":", capture the pathname segment as a named param
//    - Otherwise, segments must match exactly
// 4. If all segments match → { matched: true, params: { ... } }
//
// Examples:
//   matchPath("/api/projects/:id", "/api/projects/123")
//   → { matched: true, params: { id: "123" } }
//
//   matchPath("/api/projects/:id", "/api/tasks/123")
//   → { matched: false, params: {} }
export function matchPath(
  pattern: string,
  pathname: string
): { matched: boolean; params: Record<string, string> } {
  throw new Error("Not implemented");
}
