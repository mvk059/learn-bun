# 5.3 Validation

## What You'll Learn

- Writing input validation functions that collect multiple errors
- Field-level validation with type checking and constraints
- Partial validation for update (PATCH/PUT) operations
- Why server-side validation is critical even when clients validate too

## Why Server-Side Validation Matters

Client-side validation (in the browser or mobile app) improves user experience by giving
immediate feedback, but it provides **zero security**. Any HTTP client -- curl, Postman, a
script, a malicious actor -- can bypass your frontend entirely and send arbitrary data to
your API. Server-side validation is the only thing standing between your database and
garbage, injections, or outright attacks.

Rules of thumb:

1. **Never trust incoming data.** Validate every field on every request.
2. **Collect all errors at once.** Returning one error at a time forces users into a
   frustrating guessing game. Return every problem you find so the client can fix
   everything in a single pass.
3. **Validate types and constraints.** A field might exist but be the wrong type, empty,
   too long, or outside an allowed set of values.
4. **Treat missing and null differently from invalid.** "Field not provided" and "field
   provided but wrong" are distinct situations, especially for updates.

## Validation Strategy

The pattern we use here is simple and dependency-free:

```typescript
function validateSomething(input: Record<string, any>): string[] {
  const errors: string[] = [];

  if (!input.name || typeof input.name !== "string") {
    errors.push("Name is required");
  }

  // ... more checks ...

  return errors; // empty array means valid
}
```

Each validator receives a loosely-typed object (since we just parsed it from JSON) and
returns an array of human-readable error strings. An empty array means the input is valid.

### Checking Required Fields

A required field must be present, be the correct type, and satisfy any length or format
constraints:

```typescript
if (!input.title || typeof input.title !== "string" || input.title.trim().length === 0) {
  errors.push("Title is required");
} else if (input.title.length > 200) {
  errors.push("Title must be 200 characters or less");
}
```

Note the `else if` -- once we know the field is missing, there is no point checking its
length.

### Checking Optional Fields

For optional fields, we only validate when the field is actually provided:

```typescript
if (input.description !== undefined && input.description !== null) {
  if (typeof input.description === "string" && input.description.length > 500) {
    errors.push("Description must be 500 characters or less");
  }
}
```

### Enum Validation

When a field must be one of a fixed set of values:

```typescript
const validStatuses = ["todo", "in_progress", "done"];
if (input.status !== undefined && !validStatuses.includes(input.status)) {
  errors.push("Status must be one of: todo, in_progress, done");
}
```

### Date Format Validation

Dates coming from JSON are strings. A simple regex plus `Date.parse` catches most bad
inputs:

```typescript
if (input.dueDate !== undefined && input.dueDate !== null) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(input.dueDate) || isNaN(Date.parse(input.dueDate))) {
    errors.push("Due date must be in YYYY-MM-DD format");
  }
}
```

## Partial Validation for Updates

When handling PUT or PATCH requests, the client sends only the fields they want to change.
An empty body is valid (it changes nothing). But if a field **is** present, it still needs
to satisfy constraints:

```typescript
function validatePartialProject(input: Record<string, any>): string[] {
  const errors: string[] = [];

  if ("name" in input) {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      errors.push("Name must be a non-empty string");
    } else if (input.name.length > 100) {
      errors.push("Name must be 100 characters or less");
    }
  }

  if ("description" in input) {
    if (typeof input.description === "string" && input.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }
  }

  return errors;
}
```

The key difference from full validation: we use `"field" in input` instead of checking for
truthiness. This lets us distinguish "field not sent" from "field sent as empty string."

## Wiring Validation into an Endpoint

Validation functions are called early in the request handler, before touching any
business logic:

```typescript
const body = await req.json();
const errors = validateProject(body);

if (errors.length > 0) {
  return Response.json(
    { success: false, error: errors.join(", ") },
    { status: 400 }
  );
}

// Safe to proceed -- input is valid
const project = createProject(body);
return Response.json({ success: true, data: project }, { status: 201 });
```

Returning a 400 status with a clear error message tells the client exactly what went wrong
without exposing internals.

## Exercises

Open `exercise.ts` and implement the three validation functions:

1. **`validateProject`** -- full validation for project creation
2. **`validateTask`** -- full validation for task creation
3. **`validatePartialProject`** -- partial validation for project updates

### Running Tests

```bash
# Test your implementation
bun test exercise.test.ts

# Test the provided solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

## Key Takeaways

- Always validate on the server, regardless of client validation
- Collect all errors into an array and return them together
- Distinguish between required fields (must exist and be valid) and optional fields
  (only validate when present)
- Partial validation uses `"field" in input` to check presence without requiring values
- Return 400 with clear messages so clients can self-correct
- Keep validators as pure functions (input in, errors out) so they are easy to test
