/**
 * Chapter 3.5 - Router Module
 *
 * Build a reusable Router class for dispatching HTTP requests.
 */

export type RouteHandler = (
  req: Request,
  params: Record<string, string>
) => Response | Promise<Response>;

type Route = {
  method: string;
  pattern: string;
  handler: RouteHandler;
};

// TODO: Implement the Router class
//
// It should have:
// - An internal array of registered routes
// - get(pattern, handler) - register a GET route
// - post(pattern, handler) - register a POST route
// - put(pattern, handler) - register a PUT route
// - delete(pattern, handler) - register a DELETE route
// - handle(req) - match the request to a route:
//   1. Parse the pathname from req.url
//   2. Find routes where the pattern matches the pathname (use matchPath logic from 3.3)
//   3. Among matching routes, find one with the correct method
//   4. If found: call handler with (req, params)
//   5. If path matches but method doesn't: return 405 { error: "Method Not Allowed" }
//   6. If no path matches at all: return 404 { error: "Not Found" }
export class Router {
  // Add your implementation here

  get(pattern: string, handler: RouteHandler): void {
    throw new Error("Not implemented");
  }

  post(pattern: string, handler: RouteHandler): void {
    throw new Error("Not implemented");
  }

  put(pattern: string, handler: RouteHandler): void {
    throw new Error("Not implemented");
  }

  delete(pattern: string, handler: RouteHandler): void {
    throw new Error("Not implemented");
  }

  async handle(req: Request): Promise<Response> {
    throw new Error("Not implemented");
  }
}
