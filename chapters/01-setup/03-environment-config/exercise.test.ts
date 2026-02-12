import { describe, test, expect, beforeEach, afterEach } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";

// We need to re-import for each test to get fresh env reads
// Save original env values
const originalEnv = { ...process.env };

describe("Environment Config", () => {
  afterEach(() => {
    // Restore original environment
    process.env.PORT = originalEnv.PORT;
    process.env.DATABASE_URL = originalEnv.DATABASE_URL;
    process.env.JWT_SECRET = originalEnv.JWT_SECRET;
    process.env.NODE_ENV = originalEnv.NODE_ENV;
  });

  describe("getConfig", () => {
    test("returns default values when env vars are not set", async () => {
      delete process.env.PORT;
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;
      delete process.env.NODE_ENV;

      // Dynamic import to get fresh module
      const { getConfig } = await import(MODULE + "?t=" + Date.now());
      const config = getConfig();

      expect(config.port).toBe(3000);
      expect(config.databaseUrl).toBe("postgres://localhost:5432/taskmanager");
      expect(config.jwtSecret).toBe("default-dev-secret-change-me-in-production!!");
      expect(config.nodeEnv).toBe("development");
    });

    test("reads port from environment", async () => {
      process.env.PORT = "8080";
      const { getConfig } = await import(MODULE + "?t=" + Date.now() + "1");
      const config = getConfig();
      expect(config.port).toBe(8080);
    });

    test("reads all env vars", async () => {
      process.env.PORT = "4000";
      process.env.DATABASE_URL = "postgres://user:pass@db:5432/mydb";
      process.env.JWT_SECRET = "my-super-secret-key-that-is-long-enough!!";
      process.env.NODE_ENV = "production";

      const { getConfig } = await import(MODULE + "?t=" + Date.now() + "2");
      const config = getConfig();

      expect(config.port).toBe(4000);
      expect(config.databaseUrl).toBe("postgres://user:pass@db:5432/mydb");
      expect(config.jwtSecret).toBe("my-super-secret-key-that-is-long-enough!!");
      expect(config.nodeEnv).toBe("production");
    });

    test("handles invalid port gracefully with default", async () => {
      process.env.PORT = "not-a-number";
      const { getConfig } = await import(MODULE + "?t=" + Date.now() + "3");
      const config = getConfig();
      expect(config.port).toBe(3000);
    });
  });

  describe("validateConfig", () => {
    test("returns empty array for valid config", async () => {
      const { validateConfig } = await import(MODULE + "?t=" + Date.now() + "4");
      const errors = validateConfig({
        port: 3000,
        databaseUrl: "postgres://localhost:5432/taskmanager",
        jwtSecret: "a-secret-that-is-at-least-32-characters-long!!",
        nodeEnv: "development" as const,
      });
      expect(errors).toEqual([]);
    });

    test("catches short JWT secret", async () => {
      const { validateConfig } = await import(MODULE + "?t=" + Date.now() + "5");
      const errors = validateConfig({
        port: 3000,
        databaseUrl: "postgres://localhost:5432/db",
        jwtSecret: "short",
        nodeEnv: "development" as const,
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e: string) => e.toLowerCase().includes("jwt") || e.toLowerCase().includes("secret"))).toBe(true);
    });

    test("catches invalid port", async () => {
      const { validateConfig } = await import(MODULE + "?t=" + Date.now() + "6");
      const errors = validateConfig({
        port: 0,
        databaseUrl: "postgres://localhost:5432/db",
        jwtSecret: "a-secret-that-is-at-least-32-characters-long!!",
        nodeEnv: "development" as const,
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e: string) => e.toLowerCase().includes("port"))).toBe(true);
    });

    test("catches port above 65535", async () => {
      const { validateConfig } = await import(MODULE + "?t=" + Date.now() + "7");
      const errors = validateConfig({
        port: 70000,
        databaseUrl: "postgres://localhost:5432/db",
        jwtSecret: "a-secret-that-is-at-least-32-characters-long!!",
        nodeEnv: "development" as const,
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    test("catches invalid database URL", async () => {
      const { validateConfig } = await import(MODULE + "?t=" + Date.now() + "8");
      const errors = validateConfig({
        port: 3000,
        databaseUrl: "mysql://localhost/db",
        jwtSecret: "a-secret-that-is-at-least-32-characters-long!!",
        nodeEnv: "development" as const,
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e: string) => e.toLowerCase().includes("database") || e.toLowerCase().includes("url"))).toBe(true);
    });

    test("collects multiple errors", async () => {
      const { validateConfig } = await import(MODULE + "?t=" + Date.now() + "9");
      const errors = validateConfig({
        port: -1,
        databaseUrl: "invalid",
        jwtSecret: "short",
        nodeEnv: "development" as const,
      });
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
