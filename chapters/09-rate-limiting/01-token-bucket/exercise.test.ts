import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { TokenBucket } = await import(MODULE);

describe("Token Bucket", () => {
  test("starts with full capacity", () => {
    const bucket = new TokenBucket(10, 1);
    expect(bucket.getTokens()).toBe(10);
  });

  test("consume reduces tokens", () => {
    const bucket = new TokenBucket(10, 1);
    expect(bucket.consume()).toBe(true);
    expect(bucket.getTokens()).toBe(9);
  });

  test("consume fails when empty", () => {
    const bucket = new TokenBucket(2, 1);
    expect(bucket.consume()).toBe(true);
    expect(bucket.consume()).toBe(true);
    expect(bucket.consume()).toBe(false);
  });

  test("refills over time", async () => {
    const bucket = new TokenBucket(5, 10); // 10 tokens per second
    for (let i = 0; i < 5; i++) bucket.consume();
    expect(bucket.getTokens()).toBe(0);
    await new Promise(r => setTimeout(r, 250));
    expect(bucket.getTokens()).toBeGreaterThan(0);
  });

  test("does not exceed capacity", async () => {
    const bucket = new TokenBucket(5, 100);
    await new Promise(r => setTimeout(r, 200));
    expect(bucket.getTokens()).toBeLessThanOrEqual(5);
  });
});
