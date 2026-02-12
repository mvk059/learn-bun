/**
 * Chapter 6.4 - Not Found & Method Not Allowed (Solution)
 */

function matchPath(pattern: string, pathname: string): { matched: boolean; params: Record<string, string> } {
  const pp = pattern.split("/");
  const up = pathname.split("/");
  if (pp.length !== up.length) return { matched: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = up[i];
    else if (pp[i] !== up[i]) return { matched: false, params: {} };
  }
  return { matched: true, params };
}

type RouteHandler = (req: Request, params: Record<string, string>) => Response | Promise<Response>;

interface Route {
  method: string;
  pattern: string;
  handler: RouteHandler;
}

export function createServer(port: number) {
  const routes: Route[] = [
    { method: "GET", pattern: "/api/projects", handler: () => Response.json([]) },
    {
      method: "POST",
      pattern: "/api/projects",
      handler: async (req) => {
        const body = await req.json();
        return Response.json({ name: body.name }, { status: 201 });
      },
    },
    {
      method: "GET",
      pattern: "/api/projects/:id",
      handler: (req, params) => Response.json({ id: params.id }),
    },
    {
      method: "PUT",
      pattern: "/api/projects/:id",
      handler: (req, params) => Response.json({ id: params.id, updated: true }),
    },
    {
      method: "DELETE",
      pattern: "/api/projects/:id",
      handler: () => new Response(null, { status: 204 }),
    },
  ];

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      const matchingMethods: string[] = [];
      let matchedRoute: { route: Route; params: Record<string, string> } | null = null;

      for (const route of routes) {
        const result = matchPath(route.pattern, pathname);
        if (result.matched) {
          matchingMethods.push(route.method);
          if (route.method === req.method) {
            matchedRoute = { route, params: result.params };
          }
        }
      }

      if (matchedRoute) {
        return matchedRoute.route.handler(req, matchedRoute.params);
      }

      if (matchingMethods.length > 0) {
        return Response.json(
          { error: "Method Not Allowed" },
          {
            status: 405,
            headers: { Allow: matchingMethods.join(", ") },
          }
        );
      }

      return Response.json({ error: "Not Found" }, { status: 404 });
    },
  });

  return server;
}
