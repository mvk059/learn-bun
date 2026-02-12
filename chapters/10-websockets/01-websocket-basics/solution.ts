/**
 * Chapter 10.1 - WebSocket Basics (Solution)
 */

export function createWsServer(port: number) {
  return Bun.serve({
    port,
    fetch(req, server) {
      if (server.upgrade(req)) return;
      return new Response("Expected WebSocket", { status: 400 });
    },
    websocket: {
      open(ws) {},
      message(ws, message) {
        ws.send(message);
      },
      close(ws) {},
    },
  });
}
