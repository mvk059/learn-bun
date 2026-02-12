/**
 * Chapter 10.3 - Real-Time Task Updates
 */

// TODO: Implement createRealtimeServer(port)
// - WebSocket endpoint at /ws?room=project:{id}
// - Joins the WebSocket to the specified room
// - POST /broadcast { room, message } → broadcasts message to room
// - Returns { server, stop() }
export function createRealtimeServer(port: number): {
  server: ReturnType<typeof Bun.serve>;
  stop: () => void;
} {
  throw new Error("Not implemented");
}
