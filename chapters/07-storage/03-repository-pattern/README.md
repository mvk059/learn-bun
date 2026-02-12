# 7.3 Repository Pattern

## What You'll Learn

- How to abstract database access behind a clean repository interface
- Separating SQL queries from business logic
- Implementing pagination with SQL `LIMIT` and `OFFSET`
- Searching text columns with `ILIKE` for case-insensitive matching
- Using parameterized queries to prevent SQL injection

## Why the Repository Pattern?

Sprinkling raw SQL queries throughout your application leads to code that is
hard to test, hard to refactor, and easy to break. The repository pattern gives
you a single place for every query that touches a particular table. Your
business logic calls `repo.findById(id)` instead of writing SQL inline, and
if the underlying query ever needs to change, you fix it in one spot.

Benefits at a glance:

| Concern | Without pattern | With repository |
|---|---|---|
| Where is the SQL? | Scattered everywhere | One class per table |
| Testing | Requires a live DB for every test | Can mock the repo |
| Refactoring | Touch many files | Touch one file |

## Key Concepts

### Data Access Abstraction

A repository class wraps a `sql` connection and exposes methods that return
plain objects. Callers never see a SQL template literal:

```ts
import { SQL } from "bun";

class ProjectRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async findById(id: string) {
    const rows = await this.sql`
      SELECT * FROM projects WHERE id = ${id}
    `;
    return rows[0] ?? null;
  }
}
```

The constructor receives the `sql` instance via dependency injection, which
makes it easy to swap in a test database connection later.

### Creating Records with RETURNING

PostgreSQL's `RETURNING *` clause sends the newly inserted row back in the
same round-trip, so you never need a follow-up SELECT:

```ts
async create(input: { name: string; owner_id: string }) {
  const rows = await this.sql`
    INSERT INTO projects (name, owner_id)
    VALUES (${input.name}, ${input.owner_id})
    RETURNING *
  `;
  return rows[0];
}
```

### Pagination with LIMIT / OFFSET

When a table grows, you cannot return every row at once. SQL provides two
clauses for slicing result sets:

- **LIMIT** -- the maximum number of rows to return
- **OFFSET** -- how many rows to skip before starting

Together they implement page-based pagination:

```ts
async findAll(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const data = await this.sql`
    SELECT * FROM projects
    ORDER BY created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countResult = await this.sql`
    SELECT COUNT(*)::int AS count FROM projects
  `;

  const total = countResult[0].count;
  return {
    data: [...data],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
```

> **Tip:** Always pair `LIMIT/OFFSET` with a deterministic `ORDER BY` so that
> pages are stable.

### Searching with ILIKE

PostgreSQL's `ILIKE` operator performs case-insensitive pattern matching.
Combine it with `%` wildcards to search within strings:

```ts
const pattern = `%${search}%`;
const rows = await this.sql`
  SELECT * FROM projects
  WHERE name ILIKE ${pattern}
  ORDER BY created_at ASC
  LIMIT ${limit} OFFSET ${offset}
`;
```

Because `search` flows through Bun's tagged template, it is automatically
parameterized -- no risk of SQL injection, even if the user types `'; DROP TABLE`.

### Updating Only Provided Fields

A flexible update method merges the caller's input with the existing row so
that fields the caller did not mention stay the same:

```ts
async update(id: string, input: Record<string, any>) {
  const existing = await this.findById(id);
  if (!existing) return null;

  const merged = { ...existing, ...input };
  const rows = await this.sql`
    UPDATE projects
    SET name = ${merged.name},
        description = ${merged.description},
        status = ${merged.status}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ?? null;
}
```

### Deleting with Confirmation

Use `RETURNING id` to know whether a row was actually removed:

```ts
async delete(id: string) {
  const rows = await this.sql`
    DELETE FROM projects WHERE id = ${id} RETURNING id
  `;
  return rows.length > 0;
}
```

## Parameterized Queries and Security

Every value interpolated inside a `sql` tagged template is sent as a bind
parameter, never concatenated into the query string. This is the single most
important defense against SQL injection, and Bun.sql handles it automatically.

```ts
// SAFE -- parameterized
await sql`SELECT * FROM projects WHERE name = ${userInput}`;

// DANGEROUS -- never do this
await sql`SELECT * FROM projects WHERE name = '${userInput}'`;
```

## Exercise

Open **exercise.ts** and implement the `ProjectRepository` class. Each method
is stubbed with `throw new Error("Not implemented")`. Fill them in so that
the tests in **exercise.test.ts** pass.

Run the tests:

```bash
bun test exercise.test.ts
```

Check your work against the reference solution:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

## What's Next

In the next lesson you will learn how transactions and foreign key
relationships keep related data consistent across multiple tables.
