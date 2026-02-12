/**
 * Chapter 9.2 - Rate Limiter Store (Solution)
 */

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  constructor(private capacity: number, private refillRate: number) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
  consume(): boolean {
    this.refill();
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
  getTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

export class RateLimiterStore {
  private buckets = new Map<string, TokenBucket>();

  constructor(private capacity: number, private refillRate: number) {}

  private getBucket(ip: string): TokenBucket {
    let bucket = this.buckets.get(ip);
    if (!bucket) {
      bucket = new TokenBucket(this.capacity, this.refillRate);
      this.buckets.set(ip, bucket);
    }
    return bucket;
  }

  isAllowed(ip: string): boolean {
    return this.getBucket(ip).consume();
  }

  getRemainingTokens(ip: string): number {
    return this.getBucket(ip).getTokens();
  }

  cleanup(): void {
    this.buckets.clear();
  }
}
