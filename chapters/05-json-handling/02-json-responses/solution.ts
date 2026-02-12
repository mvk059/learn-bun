/**
 * Chapter 5.2 - JSON Responses (Solution)
 */

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function successResponse<T>(data: T, status: number = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function createdResponse<T>(data: T): Response {
  return successResponse(data, 201);
}

export function paginatedResponse<T>(data: T[], meta: PaginationMeta): Response {
  return Response.json({ success: true, data, meta });
}

export function errorJson(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}
