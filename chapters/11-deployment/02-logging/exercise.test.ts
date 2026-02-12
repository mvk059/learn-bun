import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { Logger, generateRequestId } = await import(MODULE);

describe("Logging", () => {
  describe("Logger", () => {
    test("info outputs JSON with level", () => {
      const logs: string[] = [];
      const logger = new Logger((msg: string) => logs.push(msg));
      logger.info("Server started", { port: 3000 });
      const parsed = JSON.parse(logs[0]);
      expect(parsed.level).toBe("info");
      expect(parsed.message).toBe("Server started");
      expect(parsed.port).toBe(3000);
    });

    test("warn outputs with warn level", () => {
      const logs: string[] = [];
      const logger = new Logger((msg: string) => logs.push(msg));
      logger.warn("Slow query", { duration: 5000 });
      const parsed = JSON.parse(logs[0]);
      expect(parsed.level).toBe("warn");
    });

    test("error outputs with error level", () => {
      const logs: string[] = [];
      const logger = new Logger((msg: string) => logs.push(msg));
      logger.error("Failed to connect", { error: "timeout" });
      const parsed = JSON.parse(logs[0]);
      expect(parsed.level).toBe("error");
      expect(parsed.error).toBe("timeout");
    });

    test("includes timestamp", () => {
      const logs: string[] = [];
      const logger = new Logger((msg: string) => logs.push(msg));
      logger.info("test");
      const parsed = JSON.parse(logs[0]);
      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });
  });

  describe("generateRequestId", () => {
    test("generates unique IDs", () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      expect(id1).not.toBe(id2);
    });

    test("returns a string", () => {
      expect(typeof generateRequestId()).toBe("string");
    });
  });
});
