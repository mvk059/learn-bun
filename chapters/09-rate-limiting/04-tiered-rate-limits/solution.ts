/**
 * Chapter 9.4 - Tiered Rate Limits (Solution)
 */

interface TierConfig {
  anonymous: number;
  member: number;
  admin: number;
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  constructor(private capacity: number, private refillRate: number) {
    this.tokens = capacity; this.lastRefill = Date.now();
  }
  private refill() {
    const now = Date.now();
    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.lastRefill) / 1000) * this.refillRate);
    this.lastRefill = now;
  }
  consume(): boolean { this.refill(); if (this.tokens >= 1) { this.tokens--; return true; } return false; }
  getTokens(): number { this.refill(); return Math.floor(this.tokens); }
}

export class TieredRateLimiter {
  private buckets = new Map<string, TokenBucket>();

  constructor(private config: TierConfig) {}

  private getLimit(role: "anonymous" | "member" | "admin"): number {
    return this.config[role];
  }

  isAllowed(ip: string, role: "anonymous" | "member" | "admin"): boolean {
    const limit = this.getLimit(role);
    if (limit === Infinity) return true;

    const key = `${ip}:${role}`;
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket(limit, limit / 60); // refill per minute
      this.buckets.set(key, bucket);
    }
    return bucket.consume();
  }

  getRemainingTokens(ip: string, role: "anonymous" | "member" | "admin"): number {
    const limit = this.getLimit(role);
    if (limit === Infinity) return Infinity;

    const key = `${ip}:${role}`;
    let bucket = this.buckets.get(key);
    if (!bucket) return limit;
    return bucket.getTokens();
  }
}
