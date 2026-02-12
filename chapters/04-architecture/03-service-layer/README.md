# 4.3 Service Layer

## What You'll Learn

- The service layer pattern and why it matters
- Separating business logic from HTTP handlers
- Building CRUD operations with in-memory storage
- Implementing pagination with metadata
- Adding search functionality to your services

## The Service Layer Pattern

In any application beyond a trivial size, you will find business logic creeping into your
HTTP handlers. Validation rules, data transformations, complex queries, and domain-specific
operations all start piling up inside route handlers. The service layer pattern solves this
by extracting business logic into dedicated classes or modules.

A service layer sits between your HTTP handlers (controllers) and your data storage. Handlers
are responsible for parsing requests and formatting responses. Services are responsible for
everything else: validation, business rules, data access, and orchestration.

```
Request --> Handler --> Service --> Storage
                |                    |
            (HTTP concerns)    (Business logic)
            - Parse body       - Validate data
            - Set status       - Apply rules
            - Format JSON      - CRUD operations
```

This separation provides several benefits:

1. **Testability** - Services can be tested without HTTP, no need to construct Request objects
2. **Reusability** - The same service can be used by REST handlers, WebSocket handlers, CLI tools
3. **Clarity** - Each layer has a single responsibility
4. **Flexibility** - You can swap storage (in-memory to database) without touching handlers

## In-Memory Storage with Map

For prototyping and testing, an in-memory `Map` is an excellent storage mechanism. It provides
O(1) lookups by key, built-in deletion, and easy iteration. Later, you can replace it with
a real database while keeping the same service interface.

```typescript
class ProjectService {
  private projects = new Map<string, Project>();

  create(input: CreateProjectInput): Project {
    const project: Project = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.projects.set(project.id, project);
    return project;
  }
}
```

The `crypto.randomUUID()` function is available globally in Bun and generates RFC 4122
version 4 UUIDs. This is a simple way to create unique identifiers without external
dependencies.

## Designing the Service Interface

A well-designed service interface uses clear types for inputs and outputs. The `Omit`
utility type is useful for defining creation inputs that exclude auto-generated fields:

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: "active" | "archived";
  createdAt: Date;
}

// Excludes fields the service generates automatically
type CreateProjectInput = Omit<Project, "id" | "createdAt">;
```

For updates, `Partial<CreateProjectInput>` allows callers to update only the fields they
care about, leaving others unchanged.

## Pagination with Metadata

When returning lists of items, returning all items at once does not scale. Pagination
breaks results into pages and includes metadata so the caller knows where they are in the
full result set.

```typescript
interface PaginatedResult<T> {
  data: T[];       // Items for the current page
  total: number;   // Total number of items across all pages
  page: number;    // Current page number (1-based)
  limit: number;   // Items per page
  totalPages: number;  // Total number of pages
}
```

The implementation uses `Array.slice()` to extract the correct window of results:

```typescript
findAll(options?: { page?: number; limit?: number }): PaginatedResult<Project> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const all = Array.from(this.projects.values());
  const total = all.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const data = all.slice(offset, offset + limit);

  return { data, total, page, limit, totalPages };
}
```

The `?? 1` and `?? 10` provide sensible defaults when no options are provided. The
`|| 1` after `Math.ceil` ensures `totalPages` is at least 1 even when the collection
is empty.

## Search Functionality

A simple search implementation filters items by matching a query string against relevant
fields. Case-insensitive matching makes the search more user-friendly:

```typescript
search(query: string): Project[] {
  const lower = query.toLowerCase();
  return Array.from(this.projects.values()).filter((p) =>
    p.name.toLowerCase().includes(lower)
  );
}
```

For production applications, you would typically use full-text search capabilities from
your database or a dedicated search engine. But for in-memory data, `String.includes()`
with `toLowerCase()` is simple and effective.

## Update and Delete Patterns

The update method merges provided fields with the existing record using the spread operator.
This ensures that only specified fields are changed:

```typescript
update(id: string, input: Partial<CreateProjectInput>): Project | null {
  const project = this.projects.get(id);
  if (!project) return null;
  const updated = { ...project, ...input };
  this.projects.set(id, updated);
  return updated;
}
```

The delete method leverages the `Map.delete()` return value, which is `true` if the key
existed and `false` otherwise:

```typescript
delete(id: string): boolean {
  return this.projects.delete(id);
}
```

Returning `null` or `false` for missing records (instead of throwing) lets the caller
decide how to handle the "not found" case. An HTTP handler might return a 404, while
a batch processor might simply skip and continue.

## Using Services in Handlers

Once your service is built, handlers become thin wrappers around service calls:

```typescript
const service = new ProjectService();

const server = Bun.serve({
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/projects" && req.method === "GET") {
      const page = Number(url.searchParams.get("page") ?? "1");
      const limit = Number(url.searchParams.get("limit") ?? "10");
      return Response.json(service.findAll({ page, limit }));
    }

    // ... other routes
  },
});
```

Notice how the handler only deals with HTTP concerns (parsing query params, returning
JSON) while the service handles the business logic.

## Exercise

Implement the `ProjectService` class in `exercise.ts`. The class needs six methods:

- `create` - Add a new project with auto-generated `id` and `createdAt`
- `findById` - Look up a project by ID, return `null` if not found
- `findAll` - Return paginated results with metadata
- `update` - Partially update a project, return `null` if not found
- `delete` - Remove a project, return `true` if it existed
- `search` - Find projects by name with case-insensitive matching

Run the tests with:

```bash
bun test exercise.test.ts
```

Check the solution with:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```
