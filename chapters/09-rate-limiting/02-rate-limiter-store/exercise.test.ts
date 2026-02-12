import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { RateLimiterStore } = await import(MODULE);

describe("Rate Limiter Store", () => {
  test("allows requests under limit", () => {
    const store = new RateLimiterStore(5, 1);
    expect(store.isAllowed("192.168.1.1")).toBe(true);
    expect(store.isAllowed("192.168.1.1")).toBe(true);
  });

  test("blocks after exceeding limit", () => {
    const store = new RateLimiterStore(3, 1);
    expect(store.isAllowed("10.0.0.1")).toBe(true);
    expect(store.isAllowed("10.0.0.1")).toBe(true);
    expect(store.isAllowed("10.0.0.1")).toBe(true);
    expect(store.isAllowed("10.0.0.1")).toBe(false);
  });

  test("tracks IPs independently", () => {
    const store = new RateLimiterStore(2, 1);
    expect(store.isAllowed("ip1")).toBe(true);
    expect(store.isAllowed("ip1")).toBe(true);
    expect(store.isAllowed("ip1")).toBe(false);
    expect(store.isAllowed("ip2")).toBe(true); // different IP still has tokens
  });

  test("getRemainingTokens returns correct count", () => {
    const store = new RateLimiterStore(5, 1);
    expect(store.getRemainingTokens("newip")).toBe(5);
    store.isAllowed("newip");
    expect(store.getRemainingTokens("newip")).toBe(4);
  });

  test("cleanup removes entries", () => {
    const store = new RateLimiterStore(10, 1);
    store.isAllowed("cleanup-ip");
    expect(store.getRemainingTokens("cleanup-ip")).toBe(9);
    store.cleanup();
    // After cleanup, the IP should get fresh bucket
    expect(store.getRemainingTokens("cleanup-ip")).toBe(10);
  });
});
