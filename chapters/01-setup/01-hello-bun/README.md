# 1.1 Hello Bun

## Learning Objectives

By the end of this lesson, you will be able to:

- Run your first Bun program
- Understand how Bun runs TypeScript natively (no compilation step needed)
- Write and run tests with the built-in `bun test` runner
- Access Bun runtime information using the `Bun` global object

---

## What is Bun?

Bun is a modern, high-performance JavaScript and TypeScript runtime, designed as a
drop-in alternative to Node.js. It was built from the ground up with speed in mind,
using the JavaScriptCore engine (the same engine that powers Safari) rather than V8.

### Why Bun?

Here are the key reasons developers are adopting Bun for backend development:

1. **Native TypeScript support** -- Bun runs `.ts` files directly. There is no need
   for `tsc`, `ts-node`, or any transpilation step. You write TypeScript files and
   execute them immediately.

2. **Built-in test runner** -- Bun ships with a fast, Jest-compatible test runner.
   No need to install or configure a separate testing framework.

3. **Built-in package manager** -- `bun install` is significantly faster than `npm`
   or `yarn`. It uses a global module cache and hard links to save disk space.

4. **Built-in bundler** -- Bun can bundle your code for production without external
   tools like Webpack or esbuild.

5. **Web-standard APIs** -- Bun implements `fetch`, `Request`, `Response`,
   `WebSocket`, and other Web APIs natively, making it feel familiar if you have
   worked with browser JavaScript.

6. **Speed** -- Bun starts faster and executes JavaScript/TypeScript faster than
   Node.js in most benchmarks, thanks to JavaScriptCore and heavy optimization
   of common operations.

Throughout this tutorial, we will build a **Task Manager API** using Bun. This first
lesson introduces you to the runtime itself.

---

## Key APIs

### `Bun.version`

Returns the current Bun version as a semver string (e.g., `"1.1.38"`).

```typescript
console.log(Bun.version); // "1.1.38"
```

This is a property on the global `Bun` object, which is available in every Bun
program without any imports.

### `bun test` -- The Built-in Test Runner

Bun includes a test runner that is compatible with Jest's `expect` API. You import
test utilities from the special `"bun:test"` module:

```typescript
import { describe, test, expect } from "bun:test";

describe("my feature", () => {
  test("does something", () => {
    expect(1 + 1).toBe(2);
  });
});
```

To run tests, use the `bun test` command in your terminal:

```bash
bun test                  # runs all test files in the current directory
bun test exercise.test.ts # runs a specific test file
```

Test files should follow one of these naming conventions:
- `*.test.ts`
- `*.test.js`
- `*.spec.ts`
- `*.spec.js`

### Common `expect` Matchers

| Matcher | Description |
|---|---|
| `expect(value).toBe(expected)` | Strict equality (`===`) |
| `expect(value).toEqual(expected)` | Deep equality for objects/arrays |
| `expect(value).toMatch(regex)` | Matches a regular expression |
| `expect(value).toBeTruthy()` | Checks the value is truthy |
| `expect(value).toThrow()` | Checks that a function throws |

---

## Running Your First Bun Program

Create any `.ts` file and run it directly:

```typescript
// hello.ts
const message: string = "Hello from Bun!";
console.log(message);
console.log(`Running Bun version: ${Bun.version}`);
```

```bash
bun run hello.ts
```

That is it. No `tsconfig.json` required. No build step. Bun reads the TypeScript
file and executes it immediately.

---

## Your Task

Open `exercise.ts` and implement the two exported functions:

### 1. `greet(name: string): string`

This function takes a person's name and returns a greeting string in the following
exact format:

```
Hello, {name}! Welcome to the Task Manager API.
```

For example:
```typescript
greet("Alice");
// Returns: "Hello, Alice! Welcome to the Task Manager API."

greet("Bob");
// Returns: "Hello, Bob! Welcome to the Task Manager API."
```

### 2. `getBunVersion(): string`

This function takes no arguments and returns the current Bun version string. Use
the `Bun.version` API to retrieve it.

```typescript
getBunVersion();
// Returns something like: "1.1.38"
```

---

## Hints & Tips

- **Template literals** make string formatting straightforward in TypeScript. Use
  backticks and `${}` for interpolation:

  ```typescript
  const name = "World";
  const greeting = `Hello, ${name}!`;
  ```

- **`Bun.version`** returns a semver string like `"1.1.38"`. It is a property, not
  a function, so you access it without parentheses.

- **Exporting functions** is done with the `export` keyword in front of the function
  declaration:

  ```typescript
  export function myFunction(): string {
    return "something";
  }
  ```

- If you get stuck, remember that the tests describe the exact expected behavior.
  Read the test file (`exercise.test.ts`) to understand what output is expected.

---

## Testing

Run the tests to check your implementation:

```bash
bun test exercise.test.ts
```

You should see output similar to:

```
bun test v1.x.x

exercise.test.ts:
  Hello Bun > greet
    returns greeting with name ... pass
    returns greeting with different name ... pass
    handles empty string ... pass
  Hello Bun > getBunVersion
    returns a string ... pass
    returns a valid semver format ... pass
    matches Bun.version ... pass

 6 pass
 0 fail
```

All 6 tests should pass when your implementation is correct.

### Running the Solution

If you want to verify that the tests work against the provided solution:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

---

## Bonus Challenge

Once you have completed the main exercise, try adding a third function:

### `getRuntime(): object`

Returns an object containing information about the current Bun runtime:

```typescript
export function getRuntime() {
  return {
    runtime: "bun",
    version: Bun.version,
    platform: process.platform,
    arch: process.arch,
  };
}
```

This demonstrates that Bun also provides Node.js-compatible globals like `process`.

---

## Key Takeaways

1. Bun runs TypeScript files natively -- no compilation needed.
2. The `Bun` global object provides runtime information and utilities.
3. `bun test` is a built-in, Jest-compatible test runner.
4. Tests are imported from `"bun:test"` and use familiar `describe`/`test`/`expect`
   patterns.
5. You can export functions from `.ts` files and import them in test files just
   like you would in any modern JavaScript/TypeScript project.

---

Next up: **1.2 Project Structure** -- Setting up a proper project layout for our
Task Manager API.
