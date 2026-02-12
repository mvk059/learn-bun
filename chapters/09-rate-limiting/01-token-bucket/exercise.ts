/**
 * Chapter 9.1 - Token Bucket Algorithm
 */

// TODO: Implement TokenBucket class
// Constructor: capacity (max tokens), refillRate (tokens per second)
// Methods:
// - consume(): boolean - consume one token, return false if empty
// - getTokens(): number - return current token count (calculate refill based on elapsed time)
export class TokenBucket {
  constructor(private capacity: number, private refillRate: number) {
    throw new Error("Not implemented");
  }

  consume(): boolean {
    throw new Error("Not implemented");
  }

  getTokens(): number {
    throw new Error("Not implemented");
  }
}
