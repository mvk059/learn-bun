import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { generateDockerfile, generateDockerignore } = await import(MODULE);

describe("Dockerfile", () => {
  describe("generateDockerfile", () => {
    test("returns a string with FROM instruction", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("FROM");
    });

    test("uses oven/bun base image", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("oven/bun");
    });

    test("has WORKDIR instruction", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("WORKDIR");
    });

    test("copies package.json for dependency install", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("package.json");
    });

    test("runs bun install", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("bun install");
    });

    test("has EXPOSE instruction", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile).toContain("EXPOSE");
    });

    test("has CMD or ENTRYPOINT", () => {
      const dockerfile = generateDockerfile();
      expect(dockerfile.includes("CMD") || dockerfile.includes("ENTRYPOINT")).toBe(true);
    });
  });

  describe("generateDockerignore", () => {
    test("excludes node_modules", () => {
      const ignore = generateDockerignore();
      expect(ignore).toContain("node_modules");
    });

    test("excludes .git", () => {
      const ignore = generateDockerignore();
      expect(ignore).toContain(".git");
    });
  });
});
