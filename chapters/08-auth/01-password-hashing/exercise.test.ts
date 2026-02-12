import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { hashPassword, verifyPassword, validatePasswordStrength } = await import(MODULE);

describe("Password Hashing", () => {
  describe("hashPassword", () => {
    test("returns an argon2id hash", async () => {
      const hash = await hashPassword("MyPassword123");
      expect(hash).toStartWith("$argon2id$");
    });

    test("same password produces different hashes", async () => {
      const hash1 = await hashPassword("SamePassword1");
      const hash2 = await hashPassword("SamePassword1");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    test("verifies correct password", async () => {
      const hash = await hashPassword("CorrectPass1");
      const isValid = await verifyPassword("CorrectPass1", hash);
      expect(isValid).toBe(true);
    });

    test("rejects wrong password", async () => {
      const hash = await hashPassword("CorrectPass1");
      const isValid = await verifyPassword("WrongPass999", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("validatePasswordStrength", () => {
    test("accepts strong password", () => {
      const errors = validatePasswordStrength("MyStr0ngPass!");
      expect(errors).toEqual([]);
    });

    test("rejects short password", () => {
      const errors = validatePasswordStrength("Ab1");
      expect(errors.some((e: string) => e.toLowerCase().includes("8"))).toBe(true);
    });

    test("rejects password without uppercase", () => {
      const errors = validatePasswordStrength("nouppercase1");
      expect(errors.some((e: string) => e.toLowerCase().includes("uppercase"))).toBe(true);
    });

    test("rejects password without lowercase", () => {
      const errors = validatePasswordStrength("NOLOWERCASE1");
      expect(errors.some((e: string) => e.toLowerCase().includes("lowercase"))).toBe(true);
    });

    test("rejects password without number", () => {
      const errors = validatePasswordStrength("NoNumberHere");
      expect(errors.some((e: string) => e.toLowerCase().includes("number"))).toBe(true);
    });

    test("collects multiple errors", () => {
      const errors = validatePasswordStrength("abc");
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});
