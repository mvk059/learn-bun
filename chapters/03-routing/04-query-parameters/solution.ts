/**
 * Chapter 3.4 - Query Parameters (Solution)
 */

export type PaginationOptions = {
  page: number;
  limit: number;
};

export type SortOptions = {
  field: string;
  order: "asc" | "desc";
};

export function parsePagination(url: string): PaginationOptions {
  const params = new URL(url).searchParams;
  let page = parseInt(params.get("page") ?? "1", 10);
  let limit = parseInt(params.get("limit") ?? "10", 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit)) limit = 10;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  return { page, limit };
}

export function parseSort(url: string): SortOptions {
  const params = new URL(url).searchParams;
  const field = params.get("sort") ?? "createdAt";
  const order = params.get("order");

  return {
    field,
    order: order === "desc" ? "desc" : "asc",
  };
}

export function applyPagination<T>(items: T[], options: PaginationOptions): T[] {
  const offset = (options.page - 1) * options.limit;
  return items.slice(offset, offset + options.limit);
}

export function applySort<T>(items: T[], sort: SortOptions): T[] {
  const sorted = [...items];
  sorted.sort((a: any, b: any) => {
    const aVal = a[sort.field];
    const bVal = b[sort.field];

    let comparison: number;
    if (typeof aVal === "string" && typeof bVal === "string") {
      comparison = aVal.localeCompare(bVal);
    } else {
      comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }

    return sort.order === "desc" ? -comparison : comparison;
  });
  return sorted;
}
