/**
 * Chapter 4.4 - Middleware Pattern
 *
 * Cross-cutting concerns with composable middleware.
 */

type Handler = (req: Request) => Response | Promise<Response>;
type Middleware = (handler: Handler) => Handler;

// TODO: Implement loggingMiddleware
// Logs method and URL to console before calling handler, then logs status after
export const loggingMiddleware: Middleware = (handler) => {
  throw new Error("Not implemented");
};

// TODO: Implement corsMiddleware factory
// Takes allowed origins array. Returns a Middleware that:
// - If request Origin is in allowed list, add Access-Control-Allow-Origin header
// - For OPTIONS requests with allowed origin: return 204 with CORS headers
//   (Access-Control-Allow-Methods: "GET, POST, PUT, DELETE, OPTIONS")
//   (Access-Control-Allow-Headers: "Content-Type, Authorization")
// - If origin not in list, don't add CORS headers
export function corsMiddleware(allowedOrigins: string[]): Middleware {
  throw new Error("Not implemented");
}

// TODO: Implement timingMiddleware
// Record start time, call handler, add X-Response-Time header with "{ms}ms" format
// Note: You need to clone the response to add headers since Response headers can be immutable
export const timingMiddleware: Middleware = (handler) => {
  throw new Error("Not implemented");
};

// TODO: Implement applyMiddleware
// Takes a handler and any number of middlewares, applies them in order
// The first middleware listed wraps closest to the handler
export function applyMiddleware(handler: Handler, ...middlewares: Middleware[]): Handler {
  throw new Error("Not implemented");
}
