# 7.4 Transactions & Relations

## What You'll Learn

- How to use transactions to keep multi-table writes atomic
- Defining foreign key relationships between tables
- Understanding CASCADE behavior on delete
- Writing JOIN queries to fetch related data
- Seeding a database with consistent sample data inside a transaction

## Why Transactions Matter

A transaction groups several SQL statements into a single all-or-nothing
operation. Either every statement succeeds and the changes are committed, or
any failure rolls everything back so the database never ends up in a
half-finished state.

Consider seeding a project management database: you need a user, then
projects that reference that user, then tasks that reference the projects. If
the third INSERT fails and you are not in a transaction, you are left with
orphaned projects and a user but no tasks. A transaction prevents that.

## Key Concepts

### Starting a Transaction with sql.begin()

Bun.sql exposes transactions through `sql.begin()`. The callback receives a
transaction handle (`tx`) that you use in place of `sql` for every query
inside the transaction:

```ts
await sql.begin(async (tx) => {
  const [user] = await tx`
    INSERT INTO users (username, email, password_hash)
    VALUES ('alice', 'alice@example.com', 'hash')
    RETURNING *
  `;

  await tx`
    INSERT INTO projects (name, owner_id)
    VALUES ('My Project', ${user.id})
  `;
});
// If either INSERT fails, both are rolled back.
```

If the callback throws, the transaction is automatically rolled back. If it
completes normally, the transaction is committed.

### Foreign Key Relationships

Foreign keys enforce referential integrity at the database level. A task
cannot exist without a valid project:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'todo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Key behaviors:

| Clause | Effect when parent is deleted |
|---|---|
| `ON DELETE CASCADE` | Child rows are deleted automatically |
| `ON DELETE SET NULL` | The foreign key column becomes NULL |
| `ON DELETE RESTRICT` | The delete is blocked (default) |

In the schema above, deleting a project cascades to delete all its tasks.
Deleting a user sets `assignee_id` to NULL on any assigned tasks rather than
removing them.

### Comments and Deeper Relations

A comments table adds another level of nesting:

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Because `task_id` cascades, deleting a task removes all its comments. And
because the tasks table cascades from projects, deleting a project removes
tasks **and** their comments in one operation.

### JOIN Queries for Related Data

To fetch a project together with its tasks you can run two queries, or use a
JOIN. The two-query approach is often simpler to reason about:

```ts
async function getProjectWithTasks(sql, projectId) {
  const projects = await sql`
    SELECT * FROM projects WHERE id = ${projectId}
  `;
  if (projects.length === 0) return null;

  const tasks = await sql`
    SELECT * FROM tasks
    WHERE project_id = ${projectId}
    ORDER BY created_at ASC
  `;

  return { ...projects[0], tasks: [...tasks] };
}
```

Alternatively, a LEFT JOIN returns everything in one round-trip but requires
you to reshape the flat rows into a nested structure in JavaScript.

### Seeding Data Atomically

Wrapping seed inserts in a transaction guarantees that either all sample data
exists or none of it does. This is especially useful in CI pipelines or test
setup where a partial seed would cause confusing failures:

```ts
export async function seedDatabase(sql) {
  await sql.begin(async (tx) => {
    const [user] = await tx`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@example.com', 'hashed', 'admin')
      RETURNING *
    `;

    const [p1] = await tx`
      INSERT INTO projects (name, owner_id)
      VALUES ('Alpha', ${user.id})
      RETURNING *
    `;

    await tx`
      INSERT INTO tasks (project_id, title, status, priority)
      VALUES (${p1.id}, 'First task', 'todo', 'high')
    `;
  });
}
```

### Repository Classes for Related Tables

Each table gets its own repository. A `TaskRepository` mirrors the pattern
from Lesson 7.3 but adds relation-aware queries:

```ts
class TaskRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async findByProjectId(projectId: string) {
    const rows = await this.sql`
      SELECT * FROM tasks
      WHERE project_id = ${projectId}
      ORDER BY created_at ASC
    `;
    return [...rows];
  }
}
```

The same approach works for `CommentRepository` with `findByTaskId`.

## Exercise

Open **exercise.ts** and implement:

1. **TaskRepository** -- CRUD operations for tasks, including `findByProjectId`,
   `findByAssigneeId`, and `updateStatus`.
2. **CommentRepository** -- create and list comments for a task.
3. **seedDatabase** -- use `sql.begin()` to insert a user, two projects, and
   three tasks in a single atomic transaction.
4. **getProjectWithTasks** -- return a project object with a nested `tasks`
   array, or `null` if the project does not exist.

Run the tests:

```bash
bun test exercise.test.ts
```

Check your work against the reference solution:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

## What's Next

In the next lesson you will wire the repository layer into your HTTP server
so that API routes talk to a real database.
