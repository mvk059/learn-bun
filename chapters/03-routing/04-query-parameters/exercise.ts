/**
 * Chapter 3.4 - Query Parameters
 *
 * Parse and apply pagination, filtering, and sorting from query params.
 */

export type PaginationOptions = {
  page: number;
  limit: number;
};

export type SortOptions = {
  field: string;
  order: "asc" | "desc";
};

// TODO: Parse pagination from URL query params
// Defaults: page=1, limit=10
// Clamp: limit between 1-100, page minimum 1
// Handle non-numeric values by using defaults
export function parsePagination(url: string): PaginationOptions {
  throw new Error("Not implemented");
}

// TODO: Parse sort options from URL query params
// Default field: "createdAt", default order: "asc"
// Only accept "asc" or "desc" for order, otherwise default to "asc"
export function parseSort(url: string): SortOptions {
  throw new Error("Not implemented");
}

// TODO: Apply pagination to an array
// Calculate offset as (page - 1) * limit, then slice
export function applyPagination<T>(items: T[], options: PaginationOptions): T[] {
  throw new Error("Not implemented");
}

// TODO: Apply sorting to an array (return new sorted array, don't mutate)
// Compare values: works with strings (localeCompare) and numbers
// Reverse for descending order
export function applySort<T>(items: T[], sort: SortOptions): T[] {
  throw new Error("Not implemented");
}
