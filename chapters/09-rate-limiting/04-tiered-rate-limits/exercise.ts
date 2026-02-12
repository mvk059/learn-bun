/**
 * Chapter 9.4 - Tiered Rate Limits
 */

interface TierConfig {
  anonymous: number;
  member: number;
  admin: number;
}

// TODO: Implement TieredRateLimiter
// Constructor: takes TierConfig with limits per role
// - isAllowed(ip: string, role: "anonymous" | "member" | "admin"): boolean
//   Admin with Infinity limit always returns true
//   Track buckets per "ip:role" key
// - getRemainingTokens(ip: string, role: string): number
export class TieredRateLimiter {
  constructor(private config: TierConfig) {
    throw new Error("Not implemented");
  }

  isAllowed(ip: string, role: "anonymous" | "member" | "admin"): boolean {
    throw new Error("Not implemented");
  }

  getRemainingTokens(ip: string, role: "anonymous" | "member" | "admin"): number {
    throw new Error("Not implemented");
  }
}
