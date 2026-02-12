# 7.5 Wiring Storage to API

## What You'll Learn

- How to connect database-backed repositories to HTTP API handlers
- Building a `createApp` factory that accepts a database URL and returns a running server
- Routing HTTP requests to the correct database operations
- Returning paginated results through a JSON response envelope
- Verifying end-to-end persistence by querying the database after API calls

## Why Wire Storage to the API?

Up to this point you have built two halves of the same application
independently: an HTTP server that returns in-memory data and a repository
that talks to PostgreSQL. Neither half is useful on its own in production.
Wiring them together means every `POST` actually writes a row, every `GET`
actually reads from the table, and every `DELETE` actually removes data. The
application finally persists state across restarts.

The key architectural idea is **dependency injection at the top level**. Your
`createApp` factory receives configuration (port, database URL), creates the
database connection, and passes it down to the request handler. This keeps
every layer testable: integration tests point `createApp` at a throwaway test
database, while unit tests can still mock individual pieces.

## Key Concepts

### The createApp Factory

A factory function is the cleanest way to bootstrap a server that depends on
external resources. It accepts an options object and returns the running
server plus a `stop` function for graceful shutdown:

```ts
import { SQL } from "bun";

export function createApp(options: { port: number; databaseUrl: string }) {
  const sql = new SQL({ url: options.databaseUrl });

  const server = Bun.serve({
    port: options.port,
    async fetch(req) {
      // Route requests and query `sql` ...
    },
  });

  return {
    server,
    stop: () => {
      server.stop(true);
      sql.close();
    },
  };
}
```

Passing `port: 0` tells Bun to pick a random free port, which is ideal for
tests that run in parallel.

### Routing Inside fetch

Without a framework, you match routes by inspecting the URL pathname and HTTP
method. A small helper turns patterns like `/api/projects/:id` into a
parameter extractor:

```ts
function matchPath(pattern: string, pathname: string) {
  const patternParts = pattern.split("/");
  const urlParts = pathname.split("/");
  if (patternParts.length !== urlParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return null;
    }
  }
  return params;
}
```

With this helper, each route block is a straightforward `if` statement:

```ts
if (method === "GET" && pathname === "/api/projects") { /* list */ }
if (method === "POST" && pathname === "/api/projects") { /* create */ }

const params = matchPath("/api/projects/:id", pathname);
if (params && method === "GET") { /* get by id */ }
if (params && method === "DELETE") { /* delete */ }
```

### Response Envelope

Wrapping every response in a consistent envelope makes life easier for API
consumers. Successful responses carry a `data` field and an optional `meta`
field for pagination. Error responses carry an `error` string:

```ts
// Success
Response.json({ success: true, data: project }, { status: 201 });

// Success with pagination metadata
Response.json({
  success: true,
  data: projects,
  meta: { total, page, limit, totalPages },
});

// Error
Response.json({ success: false, error: "Not Found" }, { status: 404 });
```

### Pagination Query Parameters

The list endpoint reads `page` and `limit` from the URL search params and
clamps them to sensible defaults:

```ts
const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);
const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10") || 10));
const offset = (page - 1) * limit;
```

These values flow directly into the `LIMIT` / `OFFSET` SQL clauses you
learned in the repository pattern lesson.

### Graceful Shutdown

The `stop` function returned by `createApp` shuts down both the HTTP server
and the database connection. This is critical in tests -- if you forget to
close the `SQL` connection, the test process will hang because the event loop
still has an open socket.

```ts
stop: () => {
  server.stop(true);   // true = close idle connections immediately
  sql.close();
}
```

## Exercise

Open **exercise.ts** and implement the `createApp` factory. The function
should:

1. Open a `SQL` connection to the provided `databaseUrl`.
2. Start `Bun.serve` on the provided `port`.
3. Handle the five routes listed in the stub comments.
4. Return `{ server, stop() }`.

Run the tests:

```bash
bun test exercise.test.ts
```

Check your work against the reference solution:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

## What's Next

With storage fully wired to the API, the application persists real data. In
the next chapter you will secure it by adding password hashing,
authentication, and authorization.
