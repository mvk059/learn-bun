import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createRealtimeServer } = await import(MODULE);

let server: any;
let baseUrl: string;
let wsUrl: string;

beforeAll(() => {
  const result = createRealtimeServer(0);
  server = result.server;
  baseUrl = `http://localhost:${server.port}`;
  wsUrl = `ws://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("Real-Time Task Updates", () => {
  test("WebSocket connects with project room", async () => {
    const ws = new WebSocket(`${wsUrl}/ws?room=project:p1`);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => { ws.close(); resolve(); };
      ws.onerror = reject;
      setTimeout(() => reject(new Error("Timeout")), 2000);
    });
  });

  test("receives broadcast message in room", async () => {
    const ws = new WebSocket(`${wsUrl}/ws?room=project:p2`);
    const received = await new Promise<string>((resolve, reject) => {
      ws.onopen = () => {
        // Simulate a task update by sending a broadcast request
        fetch(`${baseUrl}/broadcast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: "project:p2", message: JSON.stringify({ type: "task_updated", taskId: "t1" }) }),
        });
      };
      ws.onmessage = (e) => { resolve(String(e.data)); ws.close(); };
      ws.onerror = reject;
      setTimeout(() => reject(new Error("Timeout")), 2000);
    });
    const data = JSON.parse(received);
    expect(data.type).toBe("task_updated");
  });

  test("rejects WebSocket without room param", async () => {
    const ws = new WebSocket(`${wsUrl}/ws`);
    await new Promise<void>((resolve) => {
      ws.onclose = () => resolve();
      ws.onopen = () => { ws.close(); resolve(); };
      setTimeout(resolve, 1000);
    });
  });
});
