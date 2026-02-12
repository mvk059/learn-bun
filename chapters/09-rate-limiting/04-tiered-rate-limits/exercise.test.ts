import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { TieredRateLimiter } = await import(MODULE);

describe("Tiered Rate Limits", () => {
  test("anonymous has lowest limit", () => {
    const limiter = new TieredRateLimiter({ anonymous: 3, member: 10, admin: Infinity });
    expect(limiter.isAllowed("ip1", "anonymous")).toBe(true);
    expect(limiter.isAllowed("ip1", "anonymous")).toBe(true);
    expect(limiter.isAllowed("ip1", "anonymous")).toBe(true);
    expect(limiter.isAllowed("ip1", "anonymous")).toBe(false);
  });

  test("member has higher limit than anonymous", () => {
    const limiter = new TieredRateLimiter({ anonymous: 2, member: 5, admin: Infinity });
    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed("member-ip", "member")).toBe(true);
    }
    expect(limiter.isAllowed("member-ip", "member")).toBe(false);
  });

  test("admin has unlimited access", () => {
    const limiter = new TieredRateLimiter({ anonymous: 1, member: 2, admin: Infinity });
    for (let i = 0; i < 100; i++) {
      expect(limiter.isAllowed("admin-ip", "admin")).toBe(true);
    }
  });

  test("different roles tracked per IP", () => {
    const limiter = new TieredRateLimiter({ anonymous: 2, member: 5, admin: Infinity });
    expect(limiter.isAllowed("shared-ip", "anonymous")).toBe(true);
    expect(limiter.isAllowed("shared-ip", "anonymous")).toBe(true);
    expect(limiter.isAllowed("shared-ip", "anonymous")).toBe(false);
    // Same IP as member gets separate bucket
    expect(limiter.isAllowed("shared-ip", "member")).toBe(true);
  });

  test("getRemainingTokens returns correct value", () => {
    const limiter = new TieredRateLimiter({ anonymous: 5, member: 10, admin: Infinity });
    expect(limiter.getRemainingTokens("new-ip", "anonymous")).toBe(5);
    limiter.isAllowed("new-ip", "anonymous");
    expect(limiter.getRemainingTokens("new-ip", "anonymous")).toBe(4);
  });
});
