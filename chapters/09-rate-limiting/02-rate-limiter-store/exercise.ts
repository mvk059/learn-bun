/**
 * Chapter 9.2 - Rate Limiter Store
 */

// TODO: Implement RateLimiterStore
// Constructor: capacity, refillRate (per second)
// - isAllowed(ip: string): boolean - check/create bucket for IP, consume token
// - getRemainingTokens(ip: string): number - return remaining tokens for IP
// - cleanup(): void - remove all tracked entries
export class RateLimiterStore {
  constructor(private capacity: number, private refillRate: number) {
    throw new Error("Not implemented");
  }

  isAllowed(ip: string): boolean {
    throw new Error("Not implemented");
  }

  getRemainingTokens(ip: string): number {
    throw new Error("Not implemented");
  }

  cleanup(): void {
    throw new Error("Not implemented");
  }
}
