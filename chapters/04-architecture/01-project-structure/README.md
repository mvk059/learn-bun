# 4.1 Project Structure

When a project grows beyond a single file, how you organize your code becomes just as
important as the code itself. A well-structured project is easier to navigate, test,
refactor, and extend. This lesson covers three foundational patterns for organizing
Bun applications: module organization, barrel exports, and the app factory pattern.

## Why Structure Matters

Consider a project where every function, type, and constant lives in one giant file.
Finding anything requires scrolling through hundreds of lines. Renaming a type means
searching the entire file. Testing one function means importing the whole world.

Breaking code into focused modules solves these problems. Each file has a single
responsibility, imports are explicit, and tests can target specific units of behavior.

## Module Organization

A well-organized Bun project typically separates code into directories by purpose:

```
src/
  constants/     # Shared constants and configuration values
    http.ts
    pagination.ts
    index.ts     # Barrel export
  types/         # TypeScript interfaces and type aliases
    project.ts
    user.ts
    index.ts
  utils/         # Pure helper functions
    validation.ts
    formatting.ts
    index.ts
  handlers/      # Request handler functions
    projects.ts
    users.ts
    index.ts
  app.ts         # App factory
  index.ts       # Entry point
```

### Constants

Constants are values that never change at runtime. Grouping them in a dedicated
directory prevents magic numbers and strings from scattering across the codebase.

```typescript
// constants/http.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

Using `as const` tells TypeScript to infer literal types (200, 201, etc.) rather than
just `number`. This provides better type safety: a function expecting
`typeof HTTP_STATUS.OK` will only accept 200, not any number.

Pagination constants are another common example:

```typescript
// constants/pagination.ts
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
```

These prevent every handler from inventing its own defaults and ensure consistent
behavior across the API.

### Types

TypeScript interfaces and type aliases belong in their own directory. This avoids
circular dependencies that can arise when types are defined alongside implementation
code.

```typescript
// types/project.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived";
  createdAt: string;
}
```

## Barrel Exports

A barrel export is an `index.ts` file that re-exports everything from sibling modules.
Instead of importing from deeply nested paths, consumers import from the directory:

```typescript
// constants/index.ts
export { HTTP_STATUS } from "./http";
export { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./pagination";
```

Now any file in the project can write:

```typescript
import { HTTP_STATUS, DEFAULT_PAGE_SIZE } from "./constants";
```

Instead of:

```typescript
import { HTTP_STATUS } from "./constants/http";
import { DEFAULT_PAGE_SIZE } from "./constants/pagination";
```

Barrel exports provide a clean public API for each directory. If you later rename or
reorganize internal files, only the barrel export needs updating -- not every consumer.

### When to Avoid Barrel Exports

Barrel exports can cause issues when they create large dependency graphs. If
`constants/index.ts` re-exports from 50 files, importing one constant pulls in all 50
modules at parse time. For most Bun server projects this is negligible, but it is worth
keeping in mind for very large codebases.

## The App Factory Pattern

Hardcoding `Bun.serve()` at the top level of a module makes the server start as soon
as the file is imported. This is a problem for testing: you cannot import the module
without launching a real server.

The **app factory pattern** wraps server creation in a function:

```typescript
export function createApp(options: { port: number }) {
  const server = Bun.serve({
    port: options.port,
    fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/health") {
        return Response.json({ status: "ok" });
      }

      return Response.json({ error: "Not Found" }, { status: 404 });
    },
  });

  return {
    server,
    stop: () => server.stop(true),
  };
}
```

This pattern provides several benefits:

1. **Testability** -- Tests call `createApp({ port: 0 })` to get an ephemeral port.
   After assertions, `app.stop()` shuts it down cleanly.
2. **Configuration** -- The caller controls the port, database connection, and any
   other dependency. No global state required.
3. **Multiple instances** -- You can spin up two servers in the same process (useful
   for integration tests that need a mock upstream service).

Passing `port: 0` tells the operating system to assign any available port. The actual
port is available via `app.server.port` after creation. This eliminates port conflicts
when running tests in parallel.

### Entry Point vs Factory

The entry point (`index.ts` or `main.ts`) is the only file that calls `createApp`
with real configuration:

```typescript
// index.ts
import { createApp } from "./app";

const app = createApp({ port: Number(process.env.PORT) || 3000 });
console.log(`Server running on port ${app.server.port}`);
```

Every other consumer -- tests, scripts, REPL exploration -- uses the factory directly.

## Putting It All Together

A minimal but well-structured project exports constants, types, and the app factory.
The exercise for this lesson asks you to:

1. Define an `HTTP_STATUS` object with standard status code constants.
2. Define `DEFAULT_PAGE_SIZE` and `MAX_PAGE_SIZE` pagination constants.
3. Implement `createApp()` using the factory pattern with a `/health` endpoint.

These three pieces form the foundation that every subsequent lesson builds upon.

## Key Takeaways

- Group code by purpose: constants, types, utils, handlers.
- Use barrel exports (`index.ts`) to provide clean import paths.
- Use `as const` for constant objects to get literal type inference.
- Wrap `Bun.serve()` in a factory function so tests control server lifecycle.
- Pass `port: 0` in tests to get an OS-assigned ephemeral port.
- Keep the entry point thin -- it should only call the factory with real config.
