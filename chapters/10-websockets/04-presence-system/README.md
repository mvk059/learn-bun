# 10.4 Presence System

## Learning Objectives

By the end of this lesson you will be able to:

- Track which users are currently online in each project room
- Implement join and leave events that update presence state
- Expose online user lists through a simple API
- Prevent duplicate user entries using Set-based tracking

## Concepts

### What Is Presence?

Presence is the feature that shows who is currently online. You see it in Slack (green dots), Google Docs (colored cursors), and Figma (avatar bubbles). It answers a simple question: "Who else is here right now?"

In a project management tool, presence tells team members who is currently viewing the same project board, enabling better collaboration and reducing conflicting edits.

### Presence vs. Room Membership

Room membership (Lesson 10.2) tracks WebSocket connections. Presence tracks users. The distinction matters because:

- A single user might have multiple connections (multiple browser tabs).
- Presence should show user identifiers (like usernames or IDs), not raw socket references.
- Presence data is often exposed via REST APIs for components that do not use WebSockets.

### The PresenceTracker Class

The core data structure mirrors the RoomManager but stores user IDs (strings) instead of WebSocket objects:

```typescript
class PresenceTracker {
  private rooms = new Map<string, Set<string>>();

  userJoined(roomId: string, userId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(userId);
  }

  userLeft(roomId: string, userId: string): void {
    this.rooms.get(roomId)?.delete(userId);
  }

  getOnlineUsers(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId) ?? []);
  }
}
```

### Using Sets to Prevent Duplicates

A user opening two browser tabs should appear online once, not twice. By storing user IDs in a `Set`, duplicate `userJoined` calls for the same user are automatically deduplicated:

```typescript
tracker.userJoined("project:p1", "user1"); // Set: { "user1" }
tracker.userJoined("project:p1", "user1"); // Set: { "user1" } — no duplicate
```

However, this introduces a subtlety with disconnections. If a user has two tabs open and closes one, a naive `userLeft` call would remove them even though the other tab is still connected. Production systems handle this with reference counting:

```typescript
// Advanced: reference counting for multi-tab support
private counts = new Map<string, Map<string, number>>();

userJoined(roomId: string, userId: string): void {
  // Increment connection count for this user in this room
}

userLeft(roomId: string, userId: string): void {
  // Decrement count; only remove from presence when count reaches 0
}
```

For this lesson, we keep it simple with a basic Set.

### Broadcasting Presence Events

When a user joins or leaves, the server should broadcast a presence event to the room so other clients can update their UI:

```typescript
// In the WebSocket open handler
open(ws) {
  const { room, userId } = ws.data as any;
  tracker.userJoined(room, userId);
  roomManager.broadcast(room, JSON.stringify({
    type: "presence_joined",
    userId,
    online: tracker.getOnlineUsers(room),
  }));
}

// In the WebSocket close handler
close(ws) {
  const { room, userId } = ws.data as any;
  tracker.userLeft(room, userId);
  roomManager.broadcast(room, JSON.stringify({
    type: "presence_left",
    userId,
    online: tracker.getOnlineUsers(room),
  }));
}
```

### REST Endpoint for Presence

Not every client needs a WebSocket connection to check who is online. A REST endpoint provides presence data on demand:

```typescript
if (req.method === "GET" && url.pathname === "/presence") {
  const room = url.searchParams.get("room");
  if (!room) return new Response("Room required", { status: 400 });
  return Response.json({
    room,
    online: tracker.getOnlineUsers(room),
  });
}
```

### Integrating Presence with the Real-Time Server

Combining the RoomManager (for WebSocket message routing) with the PresenceTracker (for user state) gives you a complete real-time system:

```typescript
const roomManager = new RoomManager();
const presence = new PresenceTracker();

// WebSocket handlers use both
websocket: {
  open(ws) {
    const { room, userId } = ws.data as any;
    roomManager.join(room, ws);
    presence.userJoined(room, userId);
    // Broadcast join event
  },
  close(ws) {
    const { room, userId } = ws.data as any;
    roomManager.leave(room, ws);
    presence.userLeft(room, userId);
    // Broadcast leave event
  },
}
```

### Cleaning Up Stale Presence

In production, WebSocket connections can drop without triggering a clean `close` event (network failures, browser crashes). Strategies to handle this include:

- **Heartbeat/ping-pong** — The server periodically pings clients. If a client does not respond within a timeout, it is considered disconnected.
- **TTL-based presence** — Each presence entry has a time-to-live. Clients must periodically renew their presence.
- **Bun's built-in ping/pong** — Bun supports `ws.ping()` and the `ping`/`pong` handlers for connection health checks.

## Key Takeaways

1. Presence tracks **users** (by ID), not raw WebSocket connections.
2. `Set<string>` ensures each user appears at most once per room.
3. Broadcast `presence_joined` and `presence_left` events so clients can update in real time.
4. A REST endpoint provides presence data for non-WebSocket clients.
5. Production systems need heartbeats or TTLs to handle stale connections.

## Exercise

Implement the `PresenceTracker` class in `exercise.ts` with `userJoined`, `userLeft`, and `getOnlineUsers` methods.

Run the tests with:

```bash
bun test exercise.test.ts
```

Verify your solution with:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
