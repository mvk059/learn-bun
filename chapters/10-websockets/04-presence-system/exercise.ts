/**
 * Chapter 10.4 - Presence System
 */

// TODO: Implement PresenceTracker
// - userJoined(roomId: string, userId: string): void
// - userLeft(roomId: string, userId: string): void
// - getOnlineUsers(roomId: string): string[]
// Use Set per room to avoid duplicates
export class PresenceTracker {
  userJoined(roomId: string, userId: string): void {
    throw new Error("Not implemented");
  }

  userLeft(roomId: string, userId: string): void {
    throw new Error("Not implemented");
  }

  getOnlineUsers(roomId: string): string[] {
    throw new Error("Not implemented");
  }
}
