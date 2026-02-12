/**
 * Chapter 5.1 - Parsing JSON Body
 *
 * Safe request body reading with discriminated unions.
 */

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// TODO: Implement parseJsonBody<T>
// 1. Check Content-Type header contains "application/json"
//    - If not: return { success: false, error: "Content-Type must be application/json" }
// 2. Read body text and check it's not empty
//    - If empty: return { success: false, error: "Request body is empty" }
// 3. Try JSON.parse() on the body text
//    - If fails: return { success: false, error: "Invalid JSON: ..." }
//    - If succeeds: return { success: true, data: parsed }
export async function parseJsonBody<T>(req: Request): Promise<ParseResult<T>> {
  throw new Error("Not implemented");
}

// TODO: Implement parseJsonBodyOrThrow<T>
// Same logic as parseJsonBody but throws Error instead of returning error result
export async function parseJsonBodyOrThrow<T>(req: Request): Promise<T> {
  throw new Error("Not implemented");
}
