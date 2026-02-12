import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { getProductionConfig, validateProductionConfig, getDevelopmentConfig } = await import(MODULE);

describe("Configuration for Production", () => {
  describe("getProductionConfig", () => {
    test("returns config object", () => {
      const config = getProductionConfig({
        PORT: "3000",
        DATABASE_URL: "postgres://prod-db:5432/app",
        JWT_SECRET: "production-secret-that-is-at-least-32-chars!!",
        NODE_ENV: "production",
      });
      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe("production");
    });
  });

  describe("validateProductionConfig", () => {
    test("rejects missing JWT_SECRET", () => {
      const errors = validateProductionConfig({
        port: 3000,
        databaseUrl: "postgres://db:5432/app",
        jwtSecret: "",
        nodeEnv: "production",
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    test("rejects default JWT secret in production", () => {
      const errors = validateProductionConfig({
        port: 3000,
        databaseUrl: "postgres://db:5432/app",
        jwtSecret: "default-dev-secret-change-me-in-production!!",
        nodeEnv: "production",
      });
      expect(errors.some((e: string) => e.toLowerCase().includes("default") || e.toLowerCase().includes("secret"))).toBe(true);
    });

    test("accepts valid production config", () => {
      const errors = validateProductionConfig({
        port: 3000,
        databaseUrl: "postgres://db:5432/app",
        jwtSecret: "a-unique-production-secret-that-is-long-enough!!",
        nodeEnv: "production",
      });
      expect(errors).toEqual([]);
    });

    test("rejects missing database URL", () => {
      const errors = validateProductionConfig({
        port: 3000,
        databaseUrl: "",
        jwtSecret: "a-unique-production-secret-that-is-long-enough!!",
        nodeEnv: "production",
      });
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("getDevelopmentConfig", () => {
    test("returns config with defaults", () => {
      const config = getDevelopmentConfig({});
      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe("development");
    });

    test("allows short JWT secret in development", () => {
      const config = getDevelopmentConfig({ JWT_SECRET: "dev" });
      expect(config.jwtSecret).toBe("dev");
    });
  });
});
