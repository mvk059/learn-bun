/**
 * Chapter 10.4 - Presence System (Solution)
 */

export class PresenceTracker {
  private rooms = new Map<string, Set<string>>();

  userJoined(roomId: string, userId: string): void {
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
    this.rooms.get(roomId)!.add(userId);
  }

  userLeft(roomId: string, userId: string): void {
    this.rooms.get(roomId)?.delete(userId);
  }

  getOnlineUsers(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId) ?? []);
  }
}
