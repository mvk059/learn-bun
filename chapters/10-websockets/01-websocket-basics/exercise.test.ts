import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { createWsServer } = await import(MODULE);

let server: any;
let wsUrl: string;

beforeAll(() => {
  server = createWsServer(0);
  wsUrl = `ws://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("WebSocket Basics", () => {
  test("server starts", () => {
    expect(server.port).toBeGreaterThan(0);
  });

  test("can connect via WebSocket", async () => {
    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => { ws.close(); resolve(); };
      ws.onerror = reject;
      setTimeout(() => reject(new Error("Timeout")), 2000);
    });
  });

  test("echoes messages back", async () => {
    const ws = new WebSocket(wsUrl);
    const received = await new Promise<string>((resolve, reject) => {
      ws.onopen = () => ws.send("Hello WebSocket!");
      ws.onmessage = (e) => { resolve(String(e.data)); ws.close(); };
      ws.onerror = reject;
      setTimeout(() => reject(new Error("Timeout")), 2000);
    });
    expect(received).toBe("Hello WebSocket!");
  });

  test("handles multiple messages", async () => {
    const ws = new WebSocket(wsUrl);
    const messages: string[] = [];
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => { ws.send("msg1"); ws.send("msg2"); };
      ws.onmessage = (e) => {
        messages.push(String(e.data));
        if (messages.length === 2) { ws.close(); resolve(); }
      };
      ws.onerror = reject;
      setTimeout(() => reject(new Error("Timeout")), 2000);
    });
    expect(messages).toEqual(["msg1", "msg2"]);
  });
});
