# Chapter 7: Storage

This chapter adds persistent data storage to your application using PostgreSQL. You will learn database basics, run migrations, build repository modules, handle transactions, and wire everything together.

## Lessons

1. **PostgreSQL Basics** - Connecting to PostgreSQL from Bun and running simple queries.
2. **Migrations** - Creating and running migration scripts to manage your database schema over time.
3. **Repositories** - Building data-access modules that encapsulate SQL behind clean interfaces.
4. **Transactions** - Grouping multiple database operations into atomic transactions.
5. **Wiring** - Integrating repositories and the database connection into your application architecture.

## What You'll Learn

- How to connect to and query a PostgreSQL database from Bun.
- How to version your database schema with migration scripts.
- How to isolate data-access logic in repository modules.
- How to use transactions to guarantee data consistency.
- How to wire the storage layer into handlers and services cleanly.

## Prerequisites

- [Chapter 1: Setting Up the App](../01-setup/) - Project setup and environment configuration.
- [Chapter 4: Architecture](../04-architecture/) - Project structure, handlers, and services.
- [Chapter 5: JSON Handling](../05-json-handling/) - CRUD endpoints and JSON responses.
- [Chapter 6: Error Handling](../06-error-handling/) - Error classes and global error handling.
