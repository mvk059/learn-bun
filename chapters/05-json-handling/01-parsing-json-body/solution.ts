/**
 * Chapter 5.1 - Parsing JSON Body (Solution)
 */

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function parseJsonBody<T>(req: Request): Promise<ParseResult<T>> {
  const contentType = req.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return { success: false, error: "Content-Type must be application/json" };
  }

  const text = await req.text();
  if (!text || text.trim().length === 0) {
    return { success: false, error: "Request body is empty" };
  }

  try {
    const data = JSON.parse(text) as T;
    return { success: true, data };
  } catch (e) {
    return { success: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export async function parseJsonBodyOrThrow<T>(req: Request): Promise<T> {
  const result = await parseJsonBody<T>(req);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
