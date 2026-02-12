/**
 * Chapter 5.2 - JSON Responses
 *
 * Standardized API response envelope.
 */

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// TODO: Implement successResponse<T>
// Returns Response with JSON body: { success: true, data: T }
// Default status: 200
export function successResponse<T>(data: T, status: number = 200): Response {
  throw new Error("Not implemented");
}

// TODO: Implement createdResponse<T>
// Same as successResponse but with status 201
export function createdResponse<T>(data: T): Response {
  throw new Error("Not implemented");
}

// TODO: Implement paginatedResponse<T>
// Returns Response with JSON body: { success: true, data: T[], meta: PaginationMeta }
export function paginatedResponse<T>(data: T[], meta: PaginationMeta): Response {
  throw new Error("Not implemented");
}

// TODO: Implement errorJson
// Returns Response with JSON body: { success: false, error: message }
export function errorJson(message: string, status: number): Response {
  throw new Error("Not implemented");
}
