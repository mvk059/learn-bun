# 7.2 Schema & Migrations

## Overview

As applications evolve, the database schema must change alongside the code. Adding new tables, altering columns, and creating indexes are all routine operations. Without a structured approach, these changes become error-prone and difficult to coordinate across environments.

A **migration system** solves this by tracking schema changes as versioned, ordered steps that can be applied consistently to any database instance.

In this lesson you will learn how to:

- Design a forward-only migration system
- Track which migrations have been applied using a metadata table
- Write idempotent migrations that are safe to re-run
- Build a complete schema with foreign key relationships

## Why Migrations Matter

Consider a team of three developers working on the same project. Developer A adds a `users` table. Developer B adds a `tasks` table that references `users`. Developer C needs both tables to exist before adding `comments`.

Without migrations:

- Each developer runs ad-hoc SQL scripts
- Nobody knows what schema changes have been applied to which database
- Production deployments become a guessing game
- Rolling back is nearly impossible

With migrations:

- Schema changes are versioned and ordered
- A metadata table tracks exactly which versions have been applied
- Any database can be brought to the latest schema by running pending migrations
- New team members can set up their local database in one command

## Migration Design

### The Migration Interface

Each migration has three properties:

```typescript
interface Migration {
  version: number;   // Unique, incrementing version number
  name: string;      // Human-readable description
  up: (sql) => Promise<void>;  // Function that applies the change
}
```

### The Migrations Table

A special `_migrations` table tracks which migrations have been applied:

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  version INT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
```

### The Migration Runner

The runner follows a simple algorithm:

1. Create the `_migrations` table if it does not exist
2. Query for the highest applied version number
3. Filter the migration list to find pending migrations (version > current)
4. Sort pending migrations by version ascending
5. For each pending migration:
   - Execute the `up` function
   - Record the version in `_migrations`

```typescript
async function runMigrations(sql, migrations) {
  // Ensure _migrations table exists
  await sql`CREATE TABLE IF NOT EXISTS _migrations (...)`;

  // Get current version
  const currentVersion = await getCurrentVersion(sql);

  // Run pending migrations in order
  const pending = migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await migration.up(sql);
    await sql`INSERT INTO _migrations (version, name) VALUES (${migration.version}, ${migration.name})`;
  }
}
```

### Idempotency

Running the migration system twice should produce the same result as running it once. This is achieved by:

- Using `CREATE TABLE IF NOT EXISTS` in migration SQL
- Checking the current version before running migrations
- Only running migrations with a version greater than the current version

## Schema Design

In this exercise you will create four tables that form a task management system:

### Migration 1: Projects

```
projects
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name        VARCHAR(100) NOT NULL
  description TEXT DEFAULT ''
  owner_id    VARCHAR(50) NOT NULL
  status      VARCHAR(20) DEFAULT 'active'
  created_at  TIMESTAMPTZ DEFAULT NOW()
```

### Migration 2: Users

```
users
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  username      VARCHAR(50) UNIQUE NOT NULL
  email         VARCHAR(255) UNIQUE NOT NULL
  password_hash TEXT NOT NULL
  role          VARCHAR(20) DEFAULT 'member'
  created_at    TIMESTAMPTZ DEFAULT NOW()
```

### Migration 3: Tasks

Tasks reference both projects and users via foreign keys:

```
tasks
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  title       VARCHAR(200) NOT NULL
  description TEXT DEFAULT ''
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL
  status      VARCHAR(20) DEFAULT 'todo'
  priority    VARCHAR(10) DEFAULT 'medium'
  due_date    DATE (nullable)
  created_at  TIMESTAMPTZ DEFAULT NOW()
```

Foreign key behaviors:

- `ON DELETE CASCADE` on `project_id`: Deleting a project deletes all its tasks
- `ON DELETE SET NULL` on `assignee_id`: Deleting a user sets their assigned tasks' assignee to NULL

### Migration 4: Comments

Comments reference both tasks and users:

```
comments
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
  task_id    UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
  content    TEXT NOT NULL
  created_at TIMESTAMPTZ DEFAULT NOW()
```

## Getting the Current Version

The `getCurrentVersion` function queries the `_migrations` table for the maximum version number. If the table does not exist (first run), it should return `0` rather than throwing an error:

```typescript
async function getCurrentVersion(sql): Promise<number> {
  try {
    const rows = await sql`SELECT COALESCE(MAX(version), 0) as version FROM _migrations`;
    return rows[0].version;
  } catch {
    return 0; // Table doesn't exist yet
  }
}
```

The `COALESCE` function handles the case where `_migrations` exists but is empty, returning `0` instead of `null`.

## Exercise

Open `exercise.ts` and implement:

1. **`migrations`** -- An array of 4 migration objects (projects, users, tasks, comments)
2. **`getCurrentVersion(sql)`** -- Return the highest applied migration version, or 0
3. **`runMigrations(sql, migrationList)`** -- Apply all pending migrations in order

## Running Tests

```bash
# Run the exercise tests
bun test chapters/07-storage/02-schema-migrations/

# Run with solution
TEST_SOLUTION=1 bun test chapters/07-storage/02-schema-migrations/
```

## Key Takeaways

- Migrations provide a versioned, repeatable way to manage schema changes
- A `_migrations` metadata table tracks which versions have been applied
- Migrations should be forward-only and idempotent
- Foreign keys enforce referential integrity between related tables
- `ON DELETE CASCADE` and `ON DELETE SET NULL` define what happens to child rows when a parent is deleted
- `CHECK` constraints can restrict column values to a predefined set

## Common Pitfalls

- **Migration ordering**: Migrations that create foreign keys must run after the referenced table is created (e.g., tasks must come after projects and users)
- **Not handling missing `_migrations` table**: The first call to `getCurrentVersion` will fail if you do not catch the error when the table does not exist
- **Forgetting `IF NOT EXISTS`**: Without it, running the migration runner twice will throw an error on table creation
- **Mutable migration history**: Never modify a migration that has already been applied to a shared database -- create a new migration instead

## Next Steps

With the schema in place, the next lessons will cover transactions, advanced queries, and building a full data access layer on top of these tables.
