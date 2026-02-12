/**
 * Chapter 4.4 - Middleware Pattern (Solution)
 */

type Handler = (req: Request) => Response | Promise<Response>;
type Middleware = (handler: Handler) => Handler;

export const loggingMiddleware: Middleware = (handler) => {
  return async (req) => {
    const url = new URL(req.url);
    console.log(`→ ${req.method} ${url.pathname}`);
    const res = await handler(req);
    console.log(`← ${res.status} ${req.method} ${url.pathname}`);
    return res;
  };
};

export function corsMiddleware(allowedOrigins: string[]): Middleware {
  return (handler) => {
    return async (req) => {
      const origin = req.headers.get("Origin");
      const isAllowed = origin ? allowedOrigins.includes(origin) : false;

      if (req.method === "OPTIONS" && isAllowed) {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin!,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      }

      const res = await handler(req);

      if (isAllowed) {
        const newRes = new Response(res.body, res);
        newRes.headers.set("Access-Control-Allow-Origin", origin!);
        return newRes;
      }

      return res;
    };
  };
}

export const timingMiddleware: Middleware = (handler) => {
  return async (req) => {
    const start = performance.now();
    const res = await handler(req);
    const duration = (performance.now() - start).toFixed(2);
    const newRes = new Response(res.body, res);
    newRes.headers.set("X-Response-Time", `${duration}ms`);
    return newRes;
  };
};

export function applyMiddleware(handler: Handler, ...middlewares: Middleware[]): Handler {
  return middlewares.reduceRight((h, middleware) => middleware(h), handler);
}
