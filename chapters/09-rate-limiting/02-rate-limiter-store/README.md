# 9.2 Rate Limiter Store

## What You'll Learn

- How to track rate limits per client IP address
- Managing a collection of token buckets in a store
- Cleaning up expired entries for memory efficiency
- Building the foundation for a production rate limiter

## Introduction

In the previous lesson, we built a single `TokenBucket`. In a real server,
you need one bucket per client. A **Rate Limiter Store** manages this
collection of buckets -- creating new ones on demand, looking up existing
ones by IP address, and cleaning up stale entries to prevent memory leaks.

## Per-IP Tracking

Every client that connects to your server has an IP address. The rate limiter
store uses this IP as a key to maintain a separate token bucket for each
client. This ensures that one client's traffic does not affect another's
rate limit.

```
Client A (192.168.1.1) --> Bucket A [tokens: 8/10]
Client B (192.168.1.2) --> Bucket B [tokens: 10/10]
Client C (10.0.0.5)    --> Bucket C [tokens: 0/10]  (blocked)
```

### Lazy Bucket Creation

Buckets are created on demand -- the first time a given IP makes a request,
a new bucket is allocated with full capacity. This means the store only uses
memory proportional to the number of active clients, not the number of
possible clients.

```typescript
private getBucket(ip: string): TokenBucket {
  let bucket = this.buckets.get(ip);
  if (!bucket) {
    bucket = new TokenBucket(this.capacity, this.refillRate);
    this.buckets.set(ip, bucket);
  }
  return bucket;
}
```

## Memory Efficiency

A long-running server can accumulate thousands of bucket entries over time.
Clients that visited once and never returned still occupy memory. To handle
this, the store needs a cleanup mechanism.

### Cleanup Strategies

| Strategy              | Description                                           |
|-----------------------|-------------------------------------------------------|
| **Manual clear**      | Call `cleanup()` to remove all entries                 |
| **TTL-based**         | Remove entries older than a threshold                  |
| **Periodic sweep**    | Run cleanup on a timer (e.g., every 5 minutes)        |
| **LRU eviction**      | Remove least recently used entries when limit reached  |

For this lesson, we implement a simple `cleanup()` method that clears all
tracked entries. In production, you would typically combine TTL-based cleanup
with periodic sweeps.

### Why Cleanup Matters

Without cleanup, a rate limiter store can become a memory leak:

- A server handling 100,000 unique IPs per day accumulates entries
- Each bucket is small (a few numbers), but they add up
- After weeks of operation, memory usage grows unbounded

A periodic cleanup (e.g., every 10 minutes) that removes buckets which have
fully refilled keeps memory usage stable.

## The Store API

The `RateLimiterStore` provides a clean interface:

- **`isAllowed(ip)`**: The primary method -- checks if a request from this IP
  should be allowed. Creates a bucket if one does not exist, then attempts to
  consume a token.
- **`getRemainingTokens(ip)`**: Returns how many requests the IP has left.
  Useful for setting response headers.
- **`cleanup()`**: Removes all tracked entries, freeing memory. Fresh buckets
  will be created on the next request.

## Using a Map for Storage

We use a JavaScript `Map` for the bucket store because:

- **O(1) lookup** by key (IP address)
- **Ordered iteration** (useful for cleanup scans)
- **Built-in `.clear()`** for efficient bulk removal
- **No prototype pollution** issues (unlike plain objects)

```typescript
private buckets = new Map<string, TokenBucket>();
```

## Real-World Considerations

In production, you might replace the in-memory Map with:

- **Redis**: For distributed rate limiting across multiple server instances
- **SQLite**: For persistence across server restarts (Bun has built-in SQLite)
- **Shared memory**: For multi-worker setups using `SharedArrayBuffer`

The in-memory approach works well for single-server deployments and is the
simplest to implement correctly.

## Exercise

Implement a `RateLimiterStore` class:

- **Constructor**: `new RateLimiterStore(capacity, refillRate)` -- sets the
  token bucket parameters for all clients
- **`isAllowed(ip: string): boolean`** -- creates or retrieves the bucket for
  the given IP and consumes a token
- **`getRemainingTokens(ip: string): number`** -- returns the current token
  count for the IP
- **`cleanup(): void`** -- removes all tracked entries

You will need to include a `TokenBucket` implementation (you can reuse or
inline the one from lesson 9.1).

### Hints

- Use a `Map<string, TokenBucket>` to store buckets by IP
- The `getBucket` helper method keeps the code DRY
- `cleanup()` can simply call `this.buckets.clear()`

## Running Tests

```bash
cd chapters/09-rate-limiting/02-rate-limiter-store
bun test              # Test your exercise
TEST_SOLUTION=1 bun test  # Test the solution
```
