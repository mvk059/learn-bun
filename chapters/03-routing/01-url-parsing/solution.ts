/**
 * Chapter 3.1 - URL Parsing (Solution)
 */

export function parsePath(url: string): string {
  return new URL(url).pathname;
}

export function parseSegments(url: string): string[] {
  const pathname = new URL(url).pathname;
  return pathname.split("/").filter((s) => s.length > 0);
}

export function parseQueryParams(url: string): Record<string, string> {
  const params = new URL(url).searchParams;
  const result: Record<string, string> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

export function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
