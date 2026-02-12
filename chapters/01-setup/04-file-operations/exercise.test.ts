import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { join } from "path";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { readJsonFile, writeJsonFile, fileExists, appendToLog } = await import(MODULE);

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "bun-tutorial-"));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("File Operations", () => {
  describe("writeJsonFile and readJsonFile", () => {
    test("write then read roundtrip", async () => {
      const data = { name: "Test Project", id: 1, tags: ["bun", "tutorial"] };
      const filePath = join(tempDir, "test.json");

      await writeJsonFile(filePath, data);
      const result = await readJsonFile(filePath);

      expect(result).toEqual(data);
    });

    test("writes formatted JSON with indentation", async () => {
      const data = { key: "value" };
      const filePath = join(tempDir, "formatted.json");

      await writeJsonFile(filePath, data);
      const raw = await Bun.file(filePath).text();

      expect(raw).toContain("\n");
      expect(raw).toBe(JSON.stringify(data, null, 2));
    });

    test("readJsonFile throws on missing file", async () => {
      const filePath = join(tempDir, "nonexistent.json");

      try {
        await readJsonFile(filePath);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain("File not found");
      }
    });

    test("handles complex nested objects", async () => {
      const data = {
        project: { name: "Task Manager", version: 1 },
        tasks: [
          { id: 1, title: "Setup", done: true },
          { id: 2, title: "Build", done: false },
        ],
      };
      const filePath = join(tempDir, "complex.json");

      await writeJsonFile(filePath, data);
      const result = await readJsonFile(filePath);

      expect(result).toEqual(data);
    });
  });

  describe("fileExists", () => {
    test("returns true for existing file", async () => {
      const filePath = join(tempDir, "exists.txt");
      await Bun.write(filePath, "hello");

      expect(await fileExists(filePath)).toBe(true);
    });

    test("returns false for non-existing file", async () => {
      const filePath = join(tempDir, "nope.txt");

      expect(await fileExists(filePath)).toBe(false);
    });
  });

  describe("appendToLog", () => {
    test("creates file and appends first line", async () => {
      const logPath = join(tempDir, "app.log");

      await appendToLog(logPath, "Server started");

      const content = await Bun.file(logPath).text();
      expect(content).toContain("Server started");
      expect(content).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
      expect(content.endsWith("\n")).toBe(true);
    });

    test("appends multiple lines", async () => {
      const logPath = join(tempDir, "multi.log");

      await appendToLog(logPath, "Line 1");
      await appendToLog(logPath, "Line 2");
      await appendToLog(logPath, "Line 3");

      const content = await Bun.file(logPath).text();
      const lines = content.trim().split("\n");

      expect(lines.length).toBe(3);
      expect(lines[0]).toContain("Line 1");
      expect(lines[1]).toContain("Line 2");
      expect(lines[2]).toContain("Line 3");
    });

    test("log entries have ISO timestamp format", async () => {
      const logPath = join(tempDir, "timestamp.log");

      await appendToLog(logPath, "test message");

      const content = await Bun.file(logPath).text();
      // Should match pattern: [2024-01-15T10:30:00.000Z] test message
      expect(content).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] test message\n$/);
    });
  });
});
