# Chapter 9: Rate Limiting (Bonus)

This bonus chapter adds rate limiting to your API to prevent abuse and ensure fair usage. You will implement the token bucket algorithm, build a backing store, create middleware, and configure tiered limits.

## Lessons

1. **Token Bucket** - Understanding and implementing the token bucket rate-limiting algorithm.
2. **Store** - Building an in-memory store to track request counts per client.
3. **Middleware** - Creating rate-limiting middleware that intercepts requests before they reach handlers.
4. **Tiered Limits** - Configuring different rate limits based on user role or endpoint sensitivity.

## What You'll Learn

- How the token bucket algorithm controls request throughput over time.
- How to store and expire rate-limit state efficiently in memory.
- How to integrate rate limiting as middleware in your request pipeline.
- How to apply different limits to anonymous users, authenticated users, and admin endpoints.

## Prerequisites

- [Chapter 4: Architecture](../04-architecture/) - Middleware patterns and request pipeline.
- [Chapter 6: Error Handling](../06-error-handling/) - HTTP semantics and error responses.
- [Chapter 8: Authentication & Authorization](../08-auth/) - Auth middleware and user roles.
