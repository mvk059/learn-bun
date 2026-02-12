# 1.3 Environment Configuration

## Learning Objectives

By the end of this lesson, you will be able to:

- Use `Bun.env` and `process.env` to read environment variables
- Understand how Bun automatically loads `.env` files (no `dotenv` needed!)
- Create a typed configuration object from environment variables
- Validate configuration values and catch errors early

---

## Concepts

### Automatic .env Loading

One of Bun's quality-of-life improvements over Node.js is **automatic `.env` file loading**. In Node.js, you typically need to install and configure the `dotenv` package. Bun does this for you out of the box.

When your Bun application starts, it automatically loads environment variables from the following files (in order of priority, highest first):

| File             | Purpose                                      | Git-tracked? |
|------------------|----------------------------------------------|--------------|
| `.env.local`     | Local overrides (always loaded except test)   | No           |
| `.env.test`      | Test-specific variables (when NODE_ENV=test)  | Yes          |
| `.env.production`| Production-specific variables                 | Yes          |
| `.env.development`| Development-specific variables               | Yes          |
| `.env`           | Default values for all environments           | Yes          |

You simply create a `.env` file in your project root:

```env
PORT=3000
DATABASE_URL=postgres://localhost:5432/taskmanager
JWT_SECRET=my-super-secret-key-that-is-long-enough!!
NODE_ENV=development
```

And Bun makes those values available immediately -- no imports, no setup.

### Bun.env and process.env

Bun provides two ways to access environment variables:

```typescript
// Both work identically in Bun
const port1 = Bun.env.PORT;
const port2 = process.env.PORT;

// Bun.env is typed as Record<string, string | undefined>
// This means every value is either a string or undefined
```

`Bun.env` is Bun's own API, while `process.env` is provided for Node.js compatibility. They reference the same underlying data. You can use either one -- in this tutorial we use `process.env` for broader compatibility.

### Why Typed Configuration Matters

Environment variables are always strings (or undefined). This creates problems:

```typescript
// PORT is a string "3000", not the number 3000
const port = process.env.PORT;
// port + 1 === "30001" -- string concatenation, not addition!

// This variable might not exist at all
const secret = process.env.JWT_SECRET;
// secret.length -- runtime error if undefined!
```

By creating a **typed configuration object**, you:

1. **Convert types** -- parse strings into numbers, booleans, etc.
2. **Provide defaults** -- ensure every value has a sensible fallback
3. **Catch errors early** -- validate values before the app starts serving requests
4. **Get autocompletion** -- your IDE knows exactly what config values exist

### Default Values and Defensive Programming

The nullish coalescing operator (`??`) is perfect for providing defaults:

```typescript
// ?? returns the right side only if the left is null or undefined
const port = process.env.PORT ?? "3000";

// Compare with || which also triggers on empty string, 0, false
const port2 = process.env.PORT || "3000"; // "" would become "3000"
```

For number parsing, always handle the case where the string is not a valid number:

```typescript
const parsed = parseInt(process.env.PORT ?? "", 10);
const port = Number.isNaN(parsed) ? 3000 : parsed;
```

---

## Key APIs

### Reading Environment Variables

```typescript
// Direct access (string | undefined)
Bun.env.VARIABLE_NAME
Bun.env["VARIABLE_NAME"]

// Node.js compatible (identical behavior in Bun)
process.env.VARIABLE_NAME
process.env["VARIABLE_NAME"]
```

### Providing Default Values

```typescript
// Using nullish coalescing
const value = process.env.MY_VAR ?? "default-value";

// Parsing numbers safely
const raw = process.env.PORT;
const parsed = raw ? parseInt(raw, 10) : NaN;
const port = Number.isNaN(parsed) ? 3000 : parsed;
```

---

## Your Task

Open `exercise.ts` and implement the following:

### 1. The `AppConfig` Interface

The interface is already defined for you with these fields:

- `port` -- a number (the HTTP port to listen on)
- `databaseUrl` -- a string (PostgreSQL connection string)
- `jwtSecret` -- a string (secret for signing JWT tokens)
- `nodeEnv` -- a string union: `"development" | "production" | "test"`

### 2. `getConfig(): AppConfig`

Read environment variables and return a typed config object. Use these mappings and defaults:

| Env Variable   | Config Field  | Type   | Default Value                                      |
|----------------|---------------|--------|----------------------------------------------------|
| `PORT`         | `port`        | number | `3000`                                             |
| `DATABASE_URL` | `databaseUrl` | string | `"postgres://localhost:5432/taskmanager"`           |
| `JWT_SECRET`   | `jwtSecret`   | string | `"default-dev-secret-change-me-in-production!!"`   |
| `NODE_ENV`     | `nodeEnv`     | string | `"development"`                                    |

Important: If `PORT` is not a valid number (e.g., `"not-a-number"`), fall back to the default `3000`.

### 3. `validateConfig(config: AppConfig): string[]`

Return an array of error message strings. An empty array means the config is valid. Check these rules:

- **JWT secret** must be at least 32 characters long
- **Port** must be between 1 and 65535 (inclusive)
- **Database URL** must start with `"postgres://"` or `"postgresql://"`

Each failing rule should add a descriptive error message to the array. Collect **all** errors -- do not stop at the first one.

---

## Hints

<details>
<summary>Hint 1: Parsing PORT safely</summary>

```typescript
const portStr = process.env.PORT;
const parsed = portStr ? parseInt(portStr, 10) : NaN;
const port = Number.isNaN(parsed) ? 3000 : parsed;
```

Use `parseInt(str, 10)` and check with `Number.isNaN()`.
</details>

<details>
<summary>Hint 2: Reading NODE_ENV with a type assertion</summary>

```typescript
const nodeEnv = (process.env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development";
```

Since `process.env.NODE_ENV` is `string | undefined`, you need a type assertion to narrow it to the union type.
</details>

<details>
<summary>Hint 3: Collecting validation errors</summary>

```typescript
const errors: string[] = [];
if (someConditionFails) {
  errors.push("Description of the problem");
}
// ... more checks ...
return errors;
```

Create an array, push error messages as you find them, then return the array.
</details>

---

## Testing

Run the tests to check your solution:

```bash
# Run the exercise tests
bun test exercise.test.ts

# Run tests against the solution to verify they pass
TEST_SOLUTION=1 bun test exercise.test.ts
```

You should see all tests pass when your implementation is correct.

### What the Tests Check

- `getConfig` returns correct default values when no env vars are set
- `getConfig` reads and converts `PORT` from a string to a number
- `getConfig` reads all environment variables correctly
- `getConfig` handles invalid `PORT` values gracefully
- `validateConfig` returns an empty array for valid config
- `validateConfig` catches short JWT secrets
- `validateConfig` catches invalid ports (below 1 or above 65535)
- `validateConfig` catches invalid database URLs
- `validateConfig` collects multiple errors at once

---

## Bonus Challenges

1. **Add more validation rules**: Check that `nodeEnv` is one of the three valid values. Add a check that `databaseUrl` is a parseable URL.

2. **Create a `.env.example` file**: This is a common pattern -- commit a `.env.example` with placeholder values so other developers know which variables are needed.

3. **Freeze the config**: Use `Object.freeze()` on the returned config to prevent accidental mutation elsewhere in your codebase.

4. **Add a `requiredEnv` helper**: Write a function that throws an error if a required environment variable is missing, useful for variables that have no sensible default (like production secrets).

---

## Key Takeaways

- Bun loads `.env` files automatically -- no extra packages needed
- Always create a typed config object instead of reading `process.env` directly throughout your code
- Parse and validate environment variables at startup to catch configuration errors early
- Use the `??` operator for defaults and `Number.isNaN()` for safe number parsing
- Collect all validation errors instead of failing on the first one

## Next Lesson

In the next lesson, we will explore Bun's file I/O capabilities using `Bun.file()` and `Bun.write()`.
