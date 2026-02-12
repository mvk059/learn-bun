# 10.3 Real-Time Task Updates

## Learning Objectives

By the end of this lesson you will be able to:

- Build a real-time server that combines HTTP and WebSocket endpoints
- Route WebSocket connections to project-specific rooms using query parameters
- Broadcast task status changes to all connected clients in a project room
- Use HTTP POST endpoints to trigger WebSocket broadcasts

## Concepts

### The Real-Time Update Pattern

In a project management application, when one user updates a task, every other user viewing that project should see the change instantly. The pattern works like this:

1. A client connects via WebSocket and joins a project room (e.g., `project:p1`).
2. When a task is updated (via REST API or WebSocket message), the server broadcasts the change to everyone in that project's room.
3. Connected clients receive the update and refresh their UI.

This eliminates the need for polling and delivers updates with minimal latency.

### Combining HTTP and WebSocket

Bun's `fetch` handler processes both regular HTTP requests and WebSocket upgrade requests. This means a single server can serve your REST API and handle real-time connections:

```typescript
async fetch(req, server) {
  const url = new URL(req.url);

  // WebSocket upgrade
  if (url.pathname === "/ws") {
    const room = url.searchParams.get("room");
    if (!room) return new Response("Room required", { status: 400 });
    if (server.upgrade(req, { data: { room } })) return;
    return new Response("Upgrade failed", { status: 400 });
  }

  // REST endpoint to trigger a broadcast
  if (req.method === "POST" && url.pathname === "/broadcast") {
    const body = await req.json();
    rooms.broadcast(body.room, body.message);
    return Response.json({ sent: true });
  }

  return new Response("Not Found", { status: 404 });
}
```

### Room-Based Routing via Query Parameters

When a client connects to the WebSocket, it specifies which room to join via a query parameter:

```
ws://localhost:3000/ws?room=project:p1
```

The server extracts the `room` parameter during the upgrade and attaches it to `ws.data`:

```typescript
const room = url.searchParams.get("room");
server.upgrade(req, { data: { room } });
```

In the `open` handler, the server reads `ws.data.room` and adds the connection to the appropriate room.

### Broadcasting Task Updates

When a task changes, the server broadcasts a JSON message to the project's room:

```typescript
// Example broadcast payload
{
  "type": "task_updated",
  "taskId": "t1",
  "status": "completed",
  "updatedBy": "user1"
}
```

Any service or API endpoint can trigger this broadcast. A common approach is a dedicated POST endpoint:

```bash
curl -X POST http://localhost:3000/broadcast \
  -H "Content-Type: application/json" \
  -d '{"room":"project:p1","message":"{\"type\":\"task_updated\",\"taskId\":\"t1\"}"}'
```

### Handling Connection Lifecycle

Proper cleanup is essential. When a client disconnects, the server must remove it from its room to prevent sending messages to dead connections:

```typescript
websocket: {
  open(ws) {
    const room = (ws.data as any)?.room;
    if (room) rooms.join(room, ws);
  },
  message(ws, message) {
    // Optionally handle client-to-server messages
  },
  close(ws) {
    const room = (ws.data as any)?.room;
    if (room) rooms.leave(room, ws);
  },
}
```

### Rejecting Invalid Connections

Not every WebSocket request should be accepted. If the required `room` parameter is missing, the server should reject the upgrade by returning an HTTP error response instead of calling `server.upgrade()`:

```typescript
if (url.pathname === "/ws") {
  const room = url.searchParams.get("room");
  if (!room) return new Response("Room required", { status: 400 });
  // ... proceed with upgrade
}
```

### Message Format Conventions

For real-time systems, establishing a consistent message format helps clients parse updates predictably:

```typescript
interface TaskUpdate {
  type: "task_created" | "task_updated" | "task_deleted";
  taskId: string;
  data?: Record<string, any>;
  timestamp: number;
}
```

Clients can then switch on the `type` field to determine how to handle each message.

### Server Return Structure

The `createRealtimeServer` function returns both the server instance and a convenience `stop` method:

```typescript
function createRealtimeServer(port: number) {
  const server = Bun.serve({ /* ... */ });
  return {
    server,
    stop: () => server.stop(true),
  };
}
```

This pattern makes it easy for tests and calling code to manage the server lifecycle.

## Key Takeaways

1. A single Bun server handles both HTTP REST endpoints and WebSocket connections.
2. Query parameters on the WebSocket URL specify which room the client joins.
3. `server.upgrade(req, { data })` passes metadata to the WebSocket lifecycle handlers.
4. HTTP POST endpoints can trigger broadcasts to WebSocket rooms.
5. Always clean up connections in the `close` handler to prevent memory leaks.

## Exercise

Implement the `createRealtimeServer` function in `exercise.ts`. It should create a server with a WebSocket endpoint at `/ws?room=...` and a POST `/broadcast` endpoint that sends messages to a room.

Run the tests with:

```bash
bun test exercise.test.ts
```

Verify your solution with:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
