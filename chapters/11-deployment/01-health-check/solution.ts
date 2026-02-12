/**
 * Chapter 11.1 - Health Check & Graceful Shutdown (Solution)
 */

export function createHealthyServer(options: { port: number }) {
  const startTime = Date.now();

  const server = Bun.serve({
    port: options.port,
    fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/health") {
        return Response.json({
          status: "ok",
          uptime: Math.floor((Date.now() - startTime) / 1000),
          timestamp: new Date().toISOString(),
        });
      }

      if (url.pathname === "/ready") {
        return Response.json({ status: "ready" });
      }

      return Response.json({ error: "Not Found" }, { status: 404 });
    },
  });

  return {
    server,
    stop: () => server.stop(true),
  };
}
