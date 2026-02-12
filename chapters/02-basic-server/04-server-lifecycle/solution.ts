/**
 * Chapter 2.4 - Server Lifecycle (Solution)
 */

export type ServerOptions = {
  port: number;
  onStart?: (url: string) => void;
};

export function createTaskManagerServer(options: ServerOptions): {
  server: ReturnType<typeof Bun.serve>;
  stop: () => void;
} {
  const server = Bun.serve({
    port: options.port,
    fetch(req) {
      const url = new URL(req.url);

      if (req.method === "GET" && url.pathname === "/health") {
        return Response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
        });
      }

      return Response.json({ error: "Not Found" }, { status: 404 });
    },
  });

  const serverUrl = `http://localhost:${server.port}`;
  options.onStart?.(serverUrl);

  return {
    server,
    stop: () => server.stop(true),
  };
}
