# 10.1 WebSocket Basics

## Learning Objectives

By the end of this lesson you will be able to:

- Understand how Bun provides built-in WebSocket support without external libraries
- Create a WebSocket server using `Bun.serve()` with the `websocket` handler
- Upgrade HTTP requests to WebSocket connections using `server.upgrade()`
- Handle WebSocket lifecycle events: `open`, `message`, and `close`
- Build an echo server that sends received messages back to the client

## Concepts

### Why WebSockets?

HTTP follows a request-response model: the client asks, the server answers, and the connection is done. WebSockets break this pattern by establishing a persistent, full-duplex connection between client and server. Either side can send messages at any time without waiting for the other. This makes WebSockets ideal for chat applications, live dashboards, multiplayer games, and any scenario requiring real-time communication.

### Bun's Built-In WebSocket Support

Unlike Node.js, which requires third-party packages like `ws` or `socket.io`, Bun ships with native WebSocket support baked directly into `Bun.serve()`. This means zero dependencies, better performance, and a cleaner API.

The key insight is that `Bun.serve()` accepts both a `fetch` handler (for HTTP) and a `websocket` handler (for WebSocket connections) on the same port:

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    // Handle HTTP requests here
    // Upgrade to WebSocket when appropriate
  },
  websocket: {
    // Handle WebSocket lifecycle events here
  },
});
```

### Upgrading HTTP to WebSocket

WebSocket connections begin as HTTP requests with an `Upgrade` header. In Bun, you call `server.upgrade(req)` inside the `fetch` handler to promote the connection:

```typescript
fetch(req, server) {
  if (server.upgrade(req)) {
    // upgrade() returns true if successful
    // Bun handles the response automatically — return nothing or undefined
    return;
  }
  // If not a WebSocket request, respond with HTTP
  return new Response("Not a WebSocket request");
},
```

When `server.upgrade(req)` succeeds, Bun sends the proper `101 Switching Protocols` response behind the scenes. You do not return a `Response` object for upgraded connections.

### The WebSocket Handler Object

The `websocket` property is an object with three callback methods:

```typescript
websocket: {
  open(ws) {
    // Called when a new WebSocket connection is established
    console.log("Client connected");
  },
  message(ws, message) {
    // Called when the server receives a message from the client
    // message is a string or Buffer depending on what was sent
    console.log("Received:", message);
  },
  close(ws, code, reason) {
    // Called when the connection is closed
    console.log("Client disconnected");
  },
},
```

Each callback receives a `ws` (ServerWebSocket) object as its first parameter. This object has methods like:

- `ws.send(data)` — Send a message back to the client
- `ws.close()` — Close the connection from the server side
- `ws.data` — Custom data attached during the upgrade

### Building an Echo Server

An echo server is the "Hello World" of WebSockets. It simply sends every received message back to the sender:

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response("Expected WebSocket", { status: 400 });
  },
  websocket: {
    open(ws) {
      console.log("Connected");
    },
    message(ws, message) {
      ws.send(message); // Echo the message back
    },
    close(ws) {
      console.log("Disconnected");
    },
  },
});

console.log(`WebSocket server running on ws://localhost:${server.port}`);
```

### Testing with the Browser

You can test your WebSocket server directly from the browser console:

```javascript
const ws = new WebSocket("ws://localhost:3000");
ws.onopen = () => ws.send("Hello!");
ws.onmessage = (e) => console.log("Server says:", e.data);
```

### Passing Data During Upgrade

You can attach custom data to a WebSocket connection during the upgrade. This is useful for associating metadata (like user IDs or room names) with a connection:

```typescript
fetch(req, server) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (server.upgrade(req, { data: { userId } })) return;
  return new Response("Upgrade failed", { status: 400 });
},
websocket: {
  open(ws) {
    console.log(`User ${(ws.data as any).userId} connected`);
  },
},
```

### Binary Messages

WebSockets can handle binary data as well as text. The `message` parameter in the handler can be either a `string` or a `Buffer`:

```typescript
message(ws, message) {
  if (typeof message === "string") {
    console.log("Text:", message);
  } else {
    console.log("Binary:", message.byteLength, "bytes");
  }
  ws.send(message); // Echo both text and binary
},
```

## Key Takeaways

1. Bun has **built-in WebSocket support** — no external packages required.
2. Use `server.upgrade(req)` in the `fetch` handler to promote HTTP to WebSocket.
3. The `websocket` handler has three lifecycle methods: `open`, `message`, and `close`.
4. `ws.send(data)` sends a message to the connected client.
5. Custom data can be attached to connections via the `data` option in `server.upgrade()`.
6. Both text and binary messages are supported natively.

## Exercise

Implement the `createWsServer` function in `exercise.ts` that creates a WebSocket echo server. The server should upgrade incoming requests to WebSocket and echo any received message back to the sender.

Run the tests with:

```bash
bun test exercise.test.ts
```

Verify your solution with:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
