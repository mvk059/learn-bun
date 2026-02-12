# Bun.sh Backend Development Tutorial

Build a complete **Task/Project Manager API** from scratch using Bun's built-in APIs.

## What You'll Build

A REST API for managing projects, tasks, team members, and comments featuring:
- Full CRUD operations with pagination and search
- PostgreSQL database with migrations and repositories
- JWT authentication with role-based access control
- Rate limiting and WebSocket real-time updates
- Production-ready deployment configuration

## Prerequisites

- [Bun](https://bun.sh) v1.1+ installed
- [Docker](https://docker.com) (for PostgreSQL, needed from Chapter 7)
- Basic TypeScript knowledge

## Getting Started

```bash
# Install dependencies
bun install

# Start the tutorial from Chapter 1, Lesson 1
cd chapters/01-setup/01-hello-bun
# Read the README.md, implement exercise.ts, run tests
bun test exercise.test.ts
```

## Project Structure

```
chapters/
├── 01-setup/            # Bun basics, TypeScript, config, file I/O
├── 02-basic-server/     # HTTP server, requests, responses
├── 03-routing/          # URL parsing, path params, router
├── 04-architecture/     # Project structure, handlers, services, middleware
├── 05-json-handling/    # JSON parsing, validation, CRUD endpoints
├── 06-error-handling/   # Error classes, global handler, HTTP semantics
├── 07-storage/          # PostgreSQL with Bun.sql, migrations, repositories
├── 08-auth/             # Passwords, JWT, login, RBAC
├── 09-rate-limiting/    # Token bucket, middleware, tiered limits
├── 10-websockets/       # Real-time updates, rooms, presence
└── 11-deployment/       # Health checks, logging, Docker, production config
```

## How Each Lesson Works

Every lesson directory contains:

| File | Purpose |
|------|---------|
| `README.md` | Tutorial with concepts, examples, and your task |
| `exercise.ts` | Starter code with TODO comments for you to complete |
| `exercise.test.ts` | Tests that validate your implementation |
| `solution.ts` | Reference implementation (peek only if stuck!) |

## Running Tests

```bash
# Test your exercise
bun test chapters/01-setup/01-hello-bun/exercise.test.ts

# Test the reference solution
TEST_SOLUTION=1 bun test chapters/01-setup/01-hello-bun/exercise.test.ts

# Verify all solutions pass
bun run verify

# Verify a specific chapter
bun run verify:chapter 01
```

## Database Setup (Chapter 7+)

```bash
# Start PostgreSQL containers
docker compose up -d

# Dev database: localhost:5432
# Test database: localhost:5433 (used by tests automatically)
```

## Chapters Overview

### Core Curriculum (Chapters 1-8)

1. **Setting Up** - Bun basics, TypeScript types, environment config, file I/O
2. **Basic Server** - HTTP server, request/response handling, server lifecycle
3. **Routing** - URL parsing, method routing, path parameters, router class
4. **Architecture** - Project structure, handlers, services, middleware
5. **JSON Handling** - Body parsing, validation, full CRUD endpoints
6. **Error Handling** - Error hierarchy, global handler, HTTP semantics
7. **Storage** - PostgreSQL, migrations, repositories, transactions
8. **Authentication** - Passwords, JWT, login, auth middleware, RBAC

### Bonus Chapters (9-11)

9. **Rate Limiting** - Token bucket algorithm, tiered limits
10. **WebSockets** - Real-time updates, rooms, presence
11. **Deployment** - Health checks, logging, Docker, production config

## Tech Stack

Everything uses Bun built-in APIs except `jose` for JWT:

| Feature | Bun API |
|---------|---------|
| HTTP Server | `Bun.serve()` |
| Testing | `bun:test` |
| PostgreSQL | `Bun.sql` |
| Password Hashing | `Bun.password` |
| File I/O | `Bun.file()` / `Bun.write()` |
| Environment | `Bun.env` |
| JWT | `jose` (external) |
