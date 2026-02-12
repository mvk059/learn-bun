# 9.1 Token Bucket Algorithm

## What You'll Learn

- The fundamentals of rate limiting and why it matters
- How the token bucket algorithm works (capacity, refill rate, consumption)
- Implementing a token bucket from scratch in TypeScript
- How tokens are consumed per request and refilled over time

## Introduction

Rate limiting is one of the most important concepts in building production-ready
APIs and web services. Without it, a single misbehaving client can overwhelm
your server, degrade performance for other users, or even bring your entire
application down.

The **token bucket** algorithm is one of the most widely used approaches to rate
limiting. It is elegant, efficient, and straightforward to implement. Major
companies like Amazon, Stripe, and GitHub all use variations of this algorithm
to protect their APIs.

## How Token Bucket Works

Imagine a bucket that holds a fixed number of tokens. Each time a request comes
in, one token is removed from the bucket. If the bucket is empty, the request
is denied. Over time, the bucket is refilled at a steady rate, up to its
maximum capacity.

### Key Parameters

| Parameter       | Description                                      |
|-----------------|--------------------------------------------------|
| **Capacity**    | The maximum number of tokens the bucket can hold |
| **Refill Rate** | How many tokens are added per second              |

### The Lifecycle

1. **Initialization**: The bucket starts full (tokens = capacity)
2. **Consumption**: Each request removes one token from the bucket
3. **Refill**: Tokens are added over time based on the refill rate
4. **Overflow prevention**: Tokens never exceed the bucket's capacity

### Example Scenario

Consider a bucket with `capacity = 10` and `refillRate = 2` (tokens per second):

```
Time 0s:   Tokens = 10  (full)
Request:   Tokens = 9   (one consumed)
Request:   Tokens = 8   (one consumed)
...
Time 1s:   Tokens = 5   (5 consumed, 2 refilled -> min(10, 3+2) = 5)
```

## Lazy Refill Strategy

Rather than running a background timer to continuously add tokens, a common
optimization is to calculate refills lazily. Each time a token is requested,
we compute how much time has elapsed since the last refill and add the
appropriate number of tokens. This is both simpler and more memory-efficient.

```typescript
private refill(): void {
  const now = Date.now();
  const elapsed = (now - this.lastRefill) / 1000; // seconds
  this.tokens = Math.min(
    this.capacity,
    this.tokens + elapsed * this.refillRate
  );
  this.lastRefill = now;
}
```

This approach means we only do work when a request actually arrives, not on
every tick of a timer. For servers handling millions of buckets (one per user
or IP), this difference matters enormously.

## Why Token Bucket?

There are several rate limiting algorithms (fixed window, sliding window,
leaky bucket), but token bucket is popular because:

- **Burst tolerance**: It allows short bursts of traffic up to the bucket's
  capacity, which is realistic for user behavior
- **Smooth rate enforcement**: Over longer periods, the average rate converges
  to the refill rate
- **Memory efficient**: Only requires storing a few numbers per client
- **Simple implementation**: Easy to understand and implement correctly

## Token Bucket vs. Leaky Bucket

| Feature              | Token Bucket           | Leaky Bucket          |
|----------------------|------------------------|-----------------------|
| Burst handling       | Allows bursts          | Smooths all traffic   |
| Implementation       | Counter-based          | Queue-based           |
| Memory               | Very low               | Higher (queue)        |
| Use case             | API rate limiting      | Traffic shaping       |

## Fractional Tokens

Since we refill based on elapsed time, the internal token count can be
fractional (e.g., 3.7 tokens). This is fine internally -- we only need to
check whether there is at least 1 full token available when consuming. When
reporting the token count externally, we floor the value to give users a
clear integer count.

## Real-World Usage

In production systems, the token bucket is typically paired with:

- **Per-IP tracking**: Each client IP gets its own bucket
- **Response headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
  `X-RateLimit-Reset` inform clients of their current status
- **429 status code**: When the bucket is empty, the server responds with
  HTTP 429 Too Many Requests

We will cover these topics in the following lessons of this chapter.

## Exercise

Implement a `TokenBucket` class with the following API:

- **Constructor**: `new TokenBucket(capacity, refillRate)` -- creates a bucket
  that starts full with `capacity` tokens and refills at `refillRate` tokens
  per second
- **`consume(): boolean`** -- attempts to consume one token; returns `true` if
  successful, `false` if the bucket is empty
- **`getTokens(): number`** -- returns the current (floored) token count after
  applying any pending refill

### Hints

- Store the timestamp of the last refill using `Date.now()`
- Before consuming or reading tokens, always refill first based on elapsed time
- Use `Math.min()` to prevent tokens from exceeding capacity
- Use `Math.floor()` when returning the token count

## Running Tests

```bash
cd chapters/09-rate-limiting/01-token-bucket
bun test              # Test your exercise
TEST_SOLUTION=1 bun test  # Test the solution
```
