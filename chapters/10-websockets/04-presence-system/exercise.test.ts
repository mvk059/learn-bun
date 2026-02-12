import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { PresenceTracker } = await import(MODULE);

describe("Presence System", () => {
  test("user appears online after joining", () => {
    const tracker = new PresenceTracker();
    tracker.userJoined("project:p1", "user1");
    expect(tracker.getOnlineUsers("project:p1")).toContain("user1");
  });

  test("user disappears after leaving", () => {
    const tracker = new PresenceTracker();
    tracker.userJoined("project:p1", "user1");
    tracker.userLeft("project:p1", "user1");
    expect(tracker.getOnlineUsers("project:p1")).not.toContain("user1");
  });

  test("tracks multiple users", () => {
    const tracker = new PresenceTracker();
    tracker.userJoined("project:p1", "user1");
    tracker.userJoined("project:p1", "user2");
    const online = tracker.getOnlineUsers("project:p1");
    expect(online).toContain("user1");
    expect(online).toContain("user2");
    expect(online.length).toBe(2);
  });

  test("tracks users per room independently", () => {
    const tracker = new PresenceTracker();
    tracker.userJoined("project:p1", "user1");
    tracker.userJoined("project:p2", "user2");
    expect(tracker.getOnlineUsers("project:p1")).toEqual(["user1"]);
    expect(tracker.getOnlineUsers("project:p2")).toEqual(["user2"]);
  });

  test("returns empty array for room with no users", () => {
    const tracker = new PresenceTracker();
    expect(tracker.getOnlineUsers("empty")).toEqual([]);
  });

  test("does not duplicate users", () => {
    const tracker = new PresenceTracker();
    tracker.userJoined("project:p1", "user1");
    tracker.userJoined("project:p1", "user1");
    expect(tracker.getOnlineUsers("project:p1").length).toBe(1);
  });
});
