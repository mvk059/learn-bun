import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { TokenService } = await import(MODULE);

const SECRET = "test-secret-key-that-is-at-least-32-characters";

describe("JWT Tokens", () => {
  let tokenService: InstanceType<typeof TokenService>;

  test("TokenService can be constructed", () => {
    tokenService = new TokenService(SECRET);
    expect(tokenService).toBeDefined();
  });

  describe("createToken", () => {
    test("returns a JWT string (3 parts separated by dots)", async () => {
      tokenService = new TokenService(SECRET);
      const token = await tokenService.createToken({ userId: "u1", role: "member" });
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });
  });

  describe("verifyToken", () => {
    test("verifies a valid token and returns payload", async () => {
      tokenService = new TokenService(SECRET);
      const token = await tokenService.createToken({ userId: "u1", role: "admin" });
      const payload = await tokenService.verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe("u1");
      expect(payload!.role).toBe("admin");
    });

    test("returns null for tampered token", async () => {
      tokenService = new TokenService(SECRET);
      const token = await tokenService.createToken({ userId: "u1", role: "member" });
      const tampered = token.slice(0, -5) + "XXXXX";
      const payload = await tokenService.verifyToken(tampered);
      expect(payload).toBeNull();
    });

    test("returns null for token signed with different secret", async () => {
      const otherService = new TokenService("other-secret-key-that-is-long-enough-too!!");
      const token = await otherService.createToken({ userId: "u1", role: "member" });

      tokenService = new TokenService(SECRET);
      const payload = await tokenService.verifyToken(token);
      expect(payload).toBeNull();
    });

    test("payload contains exp and iat", async () => {
      tokenService = new TokenService(SECRET);
      const token = await tokenService.createToken({ userId: "u1", role: "member" });
      const payload = await tokenService.verifyToken(token);
      expect(payload!.exp).toBeDefined();
      expect(payload!.iat).toBeDefined();
    });
  });

  describe("decodeToken", () => {
    test("decodes token without verification", () => {
      tokenService = new TokenService(SECRET);
      // Create a simple base64 encoded JWT-like structure for decode
      // But let's test with a real token
    });
  });
});
