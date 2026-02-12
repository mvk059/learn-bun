/**
 * Chapter 9.3 - Rate Limiting Middleware (Solution)
 */

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

export function createRateLimitedServer(options: {
  port: number;
  maxRequests: number;
  windowSeconds: number;
}) {
  const buckets = new Map<string, TokenBucket>();
  const refillRate = options.maxRequests / options.windowSeconds;

  function getBucket(ip: string): TokenBucket {
    let b = buckets.get(ip);
    if (!b) { b = new TokenBucket(options.maxRequests, refillRate); buckets.set(ip, b); }
    return b;
  }

  const server = Bun.serve({
    port: options.port,
    fetch(req) {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const bucket = getBucket(ip);
      const remaining = bucket.getTokens();
      const headers: Record<string, string> = {
        "X-RateLimit-Limit": String(options.maxRequests),
        "X-RateLimit-Remaining": String(Math.max(0, remaining - 1)),
        "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + options.windowSeconds),
      };

      if (!bucket.consume()) {
        return Response.json(
          { error: "Too Many Requests" },
          { status: 429, headers: { ...headers, "Retry-After": String(options.windowSeconds) } }
        );
      }

      return Response.json({ message: "OK" }, { headers });
    },
  });

  return { server, stop: () => server.stop(true) };
}
