# Chapter 10: WebSockets (Bonus)

This bonus chapter introduces real-time communication using Bun's built-in WebSocket support. You will establish WebSocket connections, manage chat rooms, broadcast updates, and track user presence.

## Lessons

1. **WebSocket Basics** - Upgrading HTTP connections to WebSockets and handling messages.
2. **Rooms** - Organizing connected clients into named rooms for targeted messaging.
3. **Real-Time Updates** - Broadcasting data changes to connected clients as they happen.
4. **Presence** - Tracking which users are online and notifying others of join/leave events.

## What You'll Learn

- How to set up WebSocket connections using Bun's native server API.
- How to group clients into rooms and send messages to specific audiences.
- How to push real-time data updates from the server to connected clients.
- How to implement presence tracking so users can see who is online.

## Prerequisites

- [Chapter 2: Basic Server](../02-basic-server/) - HTTP server fundamentals and server lifecycle.
- [Chapter 4: Architecture](../04-architecture/) - Project structure and middleware.
- [Chapter 8: Authentication & Authorization](../08-auth/) - Auth middleware for identifying connected users.
