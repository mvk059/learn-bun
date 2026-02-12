/**
 * Chapter 10.3 - Real-Time Task Updates (Solution)
 */

class RoomManager {
  private rooms = new Map<string, Set<any>>();
  join(roomId: string, ws: any) { if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set()); this.rooms.get(roomId)!.add(ws); }
  leave(roomId: string, ws: any) { this.rooms.get(roomId)?.delete(ws); }
  broadcast(roomId: string, message: string) { const room = this.rooms.get(roomId); if (room) for (const ws of room) ws.send(message); }
}

export function createRealtimeServer(port: number) {
  const rooms = new RoomManager();

  const server = Bun.serve({
    port,
    async fetch(req, server) {
      const url = new URL(req.url);

      if (url.pathname === "/ws") {
        const room = url.searchParams.get("room");
        if (!room) return new Response("Room required", { status: 400 });
        const upgraded = server.upgrade(req, { data: { room } });
        if (upgraded) return;
        return new Response("Upgrade failed", { status: 400 });
      }

      if (req.method === "POST" && url.pathname === "/broadcast") {
        const body = await req.json();
        rooms.broadcast(body.room, body.message);
        return Response.json({ sent: true });
      }

      return new Response("Not Found", { status: 404 });
    },
    websocket: {
      open(ws) {
        const room = (ws.data as any)?.room;
        if (room) rooms.join(room, ws);
      },
      message(ws, message) {},
      close(ws) {
        const room = (ws.data as any)?.room;
        if (room) rooms.leave(room, ws);
      },
    },
  });

  return { server, stop: () => server.stop(true) };
}
