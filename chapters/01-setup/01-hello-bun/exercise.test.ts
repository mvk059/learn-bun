import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { greet, getBunVersion } = await import(MODULE);

describe("Hello Bun", () => {
  describe("greet", () => {
    test("returns greeting with name", () => {
      expect(greet("Alice")).toBe(
        "Hello, Alice! Welcome to the Task Manager API."
      );
    });

    test("returns greeting with different name", () => {
      expect(greet("Bob")).toBe(
        "Hello, Bob! Welcome to the Task Manager API."
      );
    });

    test("handles empty string", () => {
      expect(greet("")).toBe("Hello, ! Welcome to the Task Manager API.");
    });
  });

  describe("getBunVersion", () => {
    test("returns a string", () => {
      expect(typeof getBunVersion()).toBe("string");
    });

    test("returns a valid semver format", () => {
      const version = getBunVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });

    test("matches Bun.version", () => {
      expect(getBunVersion()).toBe(Bun.version);
    });
  });
});
