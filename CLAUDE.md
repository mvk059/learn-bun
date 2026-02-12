# Bun Backend Tutorial

## Project Structure
This is a self-paced tutorial for building a Task/Project Manager API with Bun.sh.
- 11 chapters, 48 lessons total
- Each lesson: README.md, exercise.ts, exercise.test.ts, solution.ts

## Testing
- Run exercise tests: `bun test chapters/XX-name/YY-lesson/exercise.test.ts`
- Run solution tests: `TEST_SOLUTION=1 bun test chapters/XX-name/YY-lesson/exercise.test.ts`
- Verify all solutions: `bun run verify`
- Verify chapter: `bun run verify:chapter 01`

## Test Pattern
Every test file uses dynamic imports:
```typescript
const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
```

## Database
- Dev DB: localhost:5432 (docker-compose postgres service)
- Test DB: localhost:5433 (docker-compose postgres-test service, tmpfs)
- Only needed from Chapter 7 onwards
- Start with: `docker compose up -d`

## Tech Stack
- Bun.serve() for HTTP
- Bun.sql for PostgreSQL (tagged template literals)
- Bun.password for Argon2id hashing
- jose for JWT (only external dependency)
- bun:test for testing
