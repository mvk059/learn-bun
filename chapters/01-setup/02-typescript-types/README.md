# 1.2 TypeScript Types

## Learning Objectives

By the end of this lesson you will be able to:

- Define TypeScript **interfaces** for domain entities
- Use **union types** to constrain values (e.g., status fields)
- Write **type guards** that validate data at runtime
- Apply **utility types** like `Omit`, `Pick`, and `Partial`
- Explain why strong typing matters for API development

---

## Why Strong Typing Matters for APIs

When you build an API, data flows across a trust boundary. Clients send JSON, databases return rows, and third-party services hand you payloads you cannot control. TypeScript's type system lets you describe exactly what shape that data should have, so the compiler can catch mismatches before your code ever runs.

Strong types also serve as living documentation. A new contributor can open your type definitions and immediately understand the domain model without reading a single line of business logic.

---

## Interfaces vs Types

TypeScript offers two ways to describe object shapes: `interface` and `type`.

```typescript
// Interface - open for extension, preferred for object shapes
interface User {
  id: string;
  username: string;
}

// Type alias - can represent unions, intersections, primitives
type Status = "active" | "archived";
```

**When to use which:**

| Feature | `interface` | `type` |
|---|---|---|
| Object shapes | Preferred | Works |
| Declaration merging | Yes | No |
| Union / intersection types | No | Preferred |
| Extending | `extends` keyword | `&` intersection |

In this course we use **interfaces** for domain entities and **type aliases** for unions and derived types.

---

## Union Types for Constrained Values

Union types let you restrict a field to a fixed set of values. This is perfect for status fields, roles, and priorities:

```typescript
type ProjectStatus = "active" | "archived";
type TaskStatus = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";
type Role = "admin" | "member";
```

The compiler will reject any value outside the union, catching typos and invalid states at build time rather than at runtime.

---

## Domain Entities

Our Task Manager API has four core entities. Here are the interfaces you need to define:

### Project

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: "active" | "archived";
  createdAt: Date;
}
```

### Task

```typescript
interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string | null;   // nullable - a task may be unassigned
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: Date | null;        // nullable - a task may have no deadline
  createdAt: Date;
}
```

### User

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "admin" | "member";
  createdAt: Date;
}
```

### Comment

```typescript
interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}
```

---

## Utility Types: Omit, Pick, Partial

TypeScript ships with several built-in utility types that derive new types from existing ones.

### `Omit<T, Keys>`

Creates a type by removing specified keys. This is ideal for "create" inputs where `id` and `createdAt` are generated server-side:

```typescript
type CreateProjectInput = Omit<Project, "id" | "createdAt">;
// Result: { name: string; description: string; ownerId: string; status: "active" | "archived" }
```

### `Pick<T, Keys>`

Creates a type by keeping only the specified keys:

```typescript
type ProjectSummary = Pick<Project, "id" | "name" | "status">;
```

### `Partial<T>`

Makes every field optional. Useful for update inputs and factory overrides:

```typescript
type UpdateProjectInput = Partial<CreateProjectInput>;
// Every field is now optional
```

---

## Type Guards for Runtime Validation

TypeScript types are erased at runtime. When data arrives from an external source (HTTP request, file, database), you need **type guards** to validate it.

A type guard is a function whose return type is `param is Type`. If the function returns `true`, TypeScript narrows the variable's type inside the `if` block:

```typescript
function isValidProject(obj: unknown): obj is Project {
  if (obj === null || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.description === "string" &&
    typeof o.ownerId === "string" &&
    (o.status === "active" || o.status === "archived") &&
    o.createdAt instanceof Date
  );
}
```

**Key checks to perform:**

1. Reject `null` and non-objects first (`typeof obj !== "object"` lets `null` through because `typeof null === "object"`, so check both).
2. Cast to `Record<string, unknown>` so you can access properties safely.
3. Validate each field's type with `typeof` for primitives and `instanceof` for class instances like `Date`.
4. For union-typed fields, check against every allowed value explicitly.

---

## Factory Functions with Defaults

A factory function creates a valid object with sensible defaults, letting callers override only the fields they care about:

```typescript
function createTaskInput(overrides?: Partial<CreateTaskInput>): CreateTaskInput {
  return {
    title: "",
    description: "",
    projectId: "",
    assigneeId: null,
    status: "todo",
    priority: "medium",
    dueDate: null,
    ...overrides,
  };
}
```

The spread operator (`...overrides`) replaces defaults with any provided values. Because `overrides` is `Partial<CreateTaskInput>`, every field is optional.

---

## Your Task

Open `exercise.ts` and complete the following:

1. **Define all four interfaces** (`Project`, `Task`, `User`, `Comment`) with the fields listed above.
2. **Create `CreateProjectInput`** using `Omit<Project, "id" | "createdAt">`.
3. **Create `CreateTaskInput`** using `Omit<Task, "id" | "createdAt">`.
4. **Implement `isValidProject`** -- a type guard that checks all required fields exist with the correct types. Remember to handle `null`, non-objects, and wrong field types.
5. **Implement `createTaskInput`** -- a factory function that returns a `CreateTaskInput` with sensible defaults and merges any overrides.

### Hints

- `typeof null === "object"` in JavaScript, so always check for `null` before checking `typeof obj === "object"`.
- Use `instanceof Date` to check if a value is a `Date` object.
- The spread operator in the factory function should come last so overrides win.

---

## Testing

Run the tests to verify your implementation:

```bash
bun test exercise.test.ts
```

To run against the provided solution:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

All tests should pass. The test suite checks:

- A valid project object is recognized by `isValidProject`
- Missing fields, wrong types, `null`, and non-objects are rejected
- `createTaskInput()` returns correct defaults
- Overrides replace only the specified fields

---

## Bonus Challenge

1. Write a `isValidTask` type guard for the `Task` interface. Remember that `assigneeId` and `dueDate` can be `null`.
2. Create an `UpdateTaskInput` type that makes every field in `CreateTaskInput` optional using `Partial`.
3. Write a `createProjectInput` factory function similar to `createTaskInput` but for projects, with a default status of `"active"`.
4. Try using `Pick` to create a `TaskSummary` type containing only `id`, `title`, `status`, and `priority`.
