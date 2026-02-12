# 9.4 Tiered Rate Limits

## What You'll Learn

- Applying different rate limits based on user roles
- Integrating authentication with rate limiting
- Handling special cases like unlimited admin access
- Tracking buckets per IP-role combination

## Introduction

Not all users are equal when it comes to API access. A free-tier user browsing
your public API should have stricter limits than a paying customer, and
administrators should have minimal restrictions. **Tiered rate limiting**
assigns different rate limits based on the user's role or subscription level.

This is how most production APIs work. Services like GitHub, Stripe, and
Twitter all offer different rate limit tiers based on authentication status
and plan level.

## Tier Architecture

A typical tier configuration looks like this:

| Role        | Requests/Window | Use Case                    |
|-------------|----------------|-----------------------------|
| Anonymous   | 10-30          | Unauthenticated visitors    |
| Member      | 100-500        | Registered free-tier users  |
| Admin       | Unlimited      | Internal tools, operators   |

### Why Tiers Matter

- **Protect against abuse**: Anonymous users get tight limits to prevent
  scraping and denial-of-service attacks
- **Incentivize upgrades**: Higher limits for paying members encourage
  free-tier users to subscribe
- **Operational freedom**: Admins need unrestricted access for monitoring,
  debugging, and maintenance

## Per-IP-Role Tracking

The key insight for tiered rate limiting is that buckets must be tracked by
a composite key of IP address and role. This means the same IP can have
different limits depending on whether the request is anonymous or
authenticated.

```
Key: "192.168.1.1:anonymous" --> Bucket [3/10 tokens]
Key: "192.168.1.1:member"    --> Bucket [95/100 tokens]
Key: "192.168.1.1:admin"     --> (unlimited, no bucket needed)
```

Using the composite key `${ip}:${role}` ensures that:

- An anonymous request from IP X does not consume tokens from a member
  session on the same IP
- Shared IPs (corporate NATs, VPNs) do not cause cross-role interference
- Each role's limit is enforced independently

## Handling Infinity

Admin users typically have unlimited access. Rather than creating a bucket
with an impossibly large capacity, the simplest approach is to short-circuit
the check entirely:

```typescript
isAllowed(ip: string, role: "anonymous" | "member" | "admin"): boolean {
  const limit = this.getLimit(role);
  if (limit === Infinity) return true; // Always allow admins

  // ... normal bucket logic
}
```

This is both more efficient (no bucket allocation) and more correct (no risk
of eventually hitting a very large but finite limit).

## Integrating with Authentication

In a real server, you would determine the user's role from their
authentication token or session before applying rate limiting:

```typescript
fetch(req) {
  const token = req.headers.get("Authorization");
  const role = verifyToken(token); // "anonymous" | "member" | "admin"
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  if (!limiter.isAllowed(ip, role)) {
    return Response.json({ error: "Too Many Requests" }, { status: 429 });
  }

  // Handle request normally...
}
```

The rate limiter does not need to know about authentication details -- it
simply receives an IP and a role and makes a decision.

## Configuration Patterns

### Static Configuration

The simplest approach is a fixed object passed at startup:

```typescript
const limiter = new TieredRateLimiter({
  anonymous: 30,
  member: 200,
  admin: Infinity,
});
```

### Environment-Based Configuration

For production, tiers are often configured via environment variables or
a configuration file, allowing changes without code deployment:

```typescript
const limiter = new TieredRateLimiter({
  anonymous: parseInt(process.env.RATE_LIMIT_ANON || "30"),
  member: parseInt(process.env.RATE_LIMIT_MEMBER || "200"),
  admin: Infinity,
});
```

## Refill Rate Considerations

For tiered limits, the refill rate determines how quickly a user recovers
their tokens. A common approach is to set the refill rate proportional to
the capacity, so all tiers refill over the same window:

```typescript
// All tiers refill over 60 seconds
const refillRate = capacity / 60;
```

This means a member with 200 requests/minute refills at ~3.3 tokens/second,
while an anonymous user with 30 requests/minute refills at 0.5 tokens/second.

## Exercise

Implement a `TieredRateLimiter` class:

- **Constructor**: `new TieredRateLimiter(config)` where config has
  `{ anonymous: number, member: number, admin: number }`
- **`isAllowed(ip, role): boolean`** -- checks if the request is allowed
  based on the IP and role. Admin with `Infinity` limit always returns `true`.
  Uses composite `ip:role` keys for bucket tracking.
- **`getRemainingTokens(ip, role): number`** -- returns remaining tokens
  for the IP-role pair. Returns `Infinity` for admin role.

### Hints

- Use `this.config[role]` to look up the limit for a role
- Check for `Infinity` before creating or looking up buckets
- Use `${ip}:${role}` as the Map key
- Set refill rate to `limit / 60` for a 1-minute refill window
- Return the full limit if no bucket exists yet for that key

## Running Tests

```bash
cd chapters/09-rate-limiting/04-tiered-rate-limits
bun test              # Test your exercise
TEST_SOLUTION=1 bun test  # Test the solution
```
