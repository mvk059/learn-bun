/**
 * Chapter 6.2 - Global Error Handler
 *
 * Catch-all wrapper to convert errors into HTTP responses.
 */

export class HttpError extends Error {
  statusCode: number;
  details?: any;
  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

type Handler = (req: Request) => Response | Promise<Response>;

// TODO: Implement withErrorHandling
// Wraps a handler in a try/catch that:
// 1. If handler succeeds, return the response unchanged
// 2. If HttpError is thrown: return JSON response with error.statusCode,
//    body { error: message, details?: error.details }
// 3. If generic Error is thrown: return 500 JSON { error: "Internal Server Error" }
//    (don't leak internal error messages to the client)
// 4. If non-Error is thrown: return 500 JSON { error: "Internal Server Error" }
export function withErrorHandling(handler: Handler): Handler {
  throw new Error("Not implemented");
}
