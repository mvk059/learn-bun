/**
 * Chapter 2.3 - Response Building
 *
 * Create reusable helper functions for building HTTP responses.
 */

// TODO: Implement jsonResponse
// Return a Response with JSON body and Content-Type: application/json
// Default status: 200
export function jsonResponse(data: unknown, status: number = 200): Response {
  throw new Error("Not implemented");
}

// TODO: Implement errorResponse
// Return a JSON response with shape { error: message } and the given status code
export function errorResponse(message: string, status: number): Response {
  throw new Error("Not implemented");
}

// TODO: Implement redirectResponse
// Return a redirect response with Location header
// permanent=true -> 301, permanent=false/undefined -> 302
export function redirectResponse(url: string, permanent?: boolean): Response {
  throw new Error("Not implemented");
}

// TODO: Implement htmlResponse
// Return a Response with HTML body and Content-Type: text/html
export function htmlResponse(html: string): Response {
  throw new Error("Not implemented");
}

// TODO: Implement noContentResponse
// Return a 204 No Content response with empty body
export function noContentResponse(): Response {
  throw new Error("Not implemented");
}
