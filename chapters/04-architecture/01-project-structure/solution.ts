/**
 * Chapter 4.1 - Project Structure (Solution)
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function createApp(options: { port: number }) {
  const server = Bun.serve({
    port: options.port,
    fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/health") {
        return Response.json({ status: "ok" });
      }

      return Response.json({ error: "Not Found" }, { status: 404 });
    },
  });

  return {
    server,
    stop: () => server.stop(true),
  };
}
