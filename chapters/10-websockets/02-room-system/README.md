# 10.2 Room System

## Learning Objectives

By the end of this lesson you will be able to:

- Design a room-based system for organizing WebSocket connections
- Implement join and leave operations for room membership
- Broadcast messages to all members of a specific room
- Isolate communication so messages only reach intended recipients

## Concepts

### Why Rooms?

A raw WebSocket server treats every connection equally. But in most real applications, you need to group connections logically. A chat app has channels. A project management tool has project boards. A game has lobbies. Rooms (also called channels or topics) let you organize connections into named groups and broadcast messages only to the relevant subset of clients.

### Room Architecture

A room system is fundamentally a mapping from room names to sets of WebSocket connections:

```
rooms: Map<string, Set<WebSocket>>

"project:p1" → { ws_alice, ws_bob }
"project:p2" → { ws_charlie }
"chat:general" → { ws_alice, ws_charlie }
```

A single WebSocket connection can belong to multiple rooms simultaneously. When you broadcast to a room, only the members of that room receive the message.

### The RoomManager Class

A clean abstraction wraps the room logic into a reusable class:

```typescript
class RoomManager {
  private rooms = new Map<string, Set<any>>();

  join(roomId: string, ws: any): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);
  }

  leave(roomId: string, ws: any): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(ws);
    }
  }

  broadcast(roomId: string, message: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      for (const ws of room) {
        ws.send(message);
      }
    }
  }

  getRoomMembers(roomId: string): Set<any> {
    return this.rooms.get(roomId) ?? new Set();
  }
}
```

### Using Sets for Membership

Using a `Set` rather than an `Array` for room members is deliberate:

- **O(1) add and delete** — Adding or removing a connection is constant-time.
- **No duplicates** — The same WebSocket cannot appear twice in a room.
- **Efficient iteration** — Broadcasting iterates through members directly.

### Integrating with Bun's WebSocket Handler

The `RoomManager` plugs into the WebSocket lifecycle cleanly:

```typescript
const rooms = new RoomManager();

const server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);
    const room = url.searchParams.get("room") ?? "default";
    if (server.upgrade(req, { data: { room } })) return;
    return new Response("Upgrade failed", { status: 400 });
  },
  websocket: {
    open(ws) {
      const room = (ws.data as any).room;
      rooms.join(room, ws);
    },
    message(ws, message) {
      const room = (ws.data as any).room;
      rooms.broadcast(room, String(message));
    },
    close(ws) {
      const room = (ws.data as any).room;
      rooms.leave(room, ws);
    },
  },
});
```

### Room Naming Conventions

A common pattern is to use namespaced room names with a colon separator:

- `project:abc123` — A project board
- `chat:general` — A chat channel
- `user:u1` — A personal notification channel

This makes it easy to parse and route messages based on the room type.

### Cleaning Up Empty Rooms

In production systems, you may want to remove rooms from the map once all members have left to prevent memory leaks:

```typescript
leave(roomId: string, ws: any): void {
  const room = this.rooms.get(roomId);
  if (room) {
    room.delete(ws);
    if (room.size === 0) {
      this.rooms.delete(roomId);
    }
  }
}
```

### Broadcast Variants

Beyond broadcasting to all members, you may need:

- **Broadcast to others** — Send to everyone in the room except the sender.
- **Send to one** — Direct message a specific connection.
- **Broadcast to all rooms** — A system-wide announcement.

```typescript
broadcastExcept(roomId: string, message: string, exclude: any): void {
  const room = this.rooms.get(roomId);
  if (room) {
    for (const ws of room) {
      if (ws !== exclude) ws.send(message);
    }
  }
}
```

## Key Takeaways

1. Rooms group WebSocket connections into logical channels for targeted messaging.
2. A `Map<string, Set<WebSocket>>` is the core data structure for room management.
3. `Set` ensures O(1) membership operations and prevents duplicates.
4. The RoomManager integrates with Bun's WebSocket `open`/`close` lifecycle events.
5. Namespaced room names (e.g., `project:id`) keep organization clean.

## Exercise

Implement the `RoomManager` class in `exercise.ts` with `join`, `leave`, `broadcast`, and `getRoomMembers` methods.

Run the tests with:

```bash
bun test exercise.test.ts
```

Verify your solution with:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
