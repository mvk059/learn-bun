import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { RoomManager } = await import(MODULE);

// Mock WebSocket for testing
class MockWs {
  messages: string[] = [];
  send(msg: string) { this.messages.push(msg); }
}

describe("Room System", () => {
  test("join adds member to room", () => {
    const rm = new RoomManager();
    const ws = new MockWs();
    rm.join("room1", ws as any);
    expect(rm.getRoomMembers("room1").size).toBe(1);
  });

  test("leave removes member from room", () => {
    const rm = new RoomManager();
    const ws = new MockWs();
    rm.join("room1", ws as any);
    rm.leave("room1", ws as any);
    expect(rm.getRoomMembers("room1").size).toBe(0);
  });

  test("broadcast sends to all members", () => {
    const rm = new RoomManager();
    const ws1 = new MockWs();
    const ws2 = new MockWs();
    rm.join("room1", ws1 as any);
    rm.join("room1", ws2 as any);
    rm.broadcast("room1", "hello");
    expect(ws1.messages).toEqual(["hello"]);
    expect(ws2.messages).toEqual(["hello"]);
  });

  test("broadcast does not send to other rooms", () => {
    const rm = new RoomManager();
    const ws1 = new MockWs();
    const ws2 = new MockWs();
    rm.join("room1", ws1 as any);
    rm.join("room2", ws2 as any);
    rm.broadcast("room1", "hello");
    expect(ws1.messages).toEqual(["hello"]);
    expect(ws2.messages).toEqual([]);
  });

  test("getRoomMembers returns empty set for unknown room", () => {
    const rm = new RoomManager();
    expect(rm.getRoomMembers("nonexistent").size).toBe(0);
  });

  test("multiple rooms work independently", () => {
    const rm = new RoomManager();
    const ws = new MockWs();
    rm.join("room1", ws as any);
    rm.join("room2", ws as any);
    expect(rm.getRoomMembers("room1").size).toBe(1);
    expect(rm.getRoomMembers("room2").size).toBe(1);
    rm.leave("room1", ws as any);
    expect(rm.getRoomMembers("room1").size).toBe(0);
    expect(rm.getRoomMembers("room2").size).toBe(1);
  });
});
