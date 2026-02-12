/**
 * Chapter 2.2 - Request Basics (Solution)
 */

export function createEchoServer(port: number) {
  return Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);
      return Response.json({
        method: req.method,
        url: req.url,
        pathname: url.pathname,
        userAgent: req.headers.get("user-agent") || "Unknown",
        contentType: req.headers.get("content-type") ?? null,
      });
    },
  });
}
