/**
 * Chapter 3.5 - Router Module (Solution)
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

function matchPath(
  pattern: string,
  pathname: string
): { matched: boolean; params: Record<string, string> } {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");

  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

export class Router {
  private routes: Route[] = [];

  get(pattern: string, handler: RouteHandler): void {
    this.routes.push({ method: "GET", pattern, handler });
  }

  post(pattern: string, handler: RouteHandler): void {
    this.routes.push({ method: "POST", pattern, handler });
  }

  put(pattern: string, handler: RouteHandler): void {
    this.routes.push({ method: "PUT", pattern, handler });
  }

  delete(pattern: string, handler: RouteHandler): void {
    this.routes.push({ method: "DELETE", pattern, handler });
  }

  async handle(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    let pathMatched = false;

    for (const route of this.routes) {
      const result = matchPath(route.pattern, pathname);
      if (result.matched) {
        pathMatched = true;
        if (route.method === method) {
          return route.handler(req, result.params);
        }
      }
    }

    if (pathMatched) {
      return Response.json({ error: "Method Not Allowed" }, { status: 405 });
    }

    return Response.json({ error: "Not Found" }, { status: 404 });
  }
}
