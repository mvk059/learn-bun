/**
 * Chapter 10.2 - Room System (Solution)
 */

export class RoomManager {
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
