# 1.4 File Operations

## Learning Objectives

By the end of this lesson, you will be able to:

- Read and write files using Bun's built-in APIs
- Work with JSON files (read, parse, and write)
- Check whether a file exists before reading it
- Handle file errors gracefully

---

## Concepts

### Bun.file() - Creating a File Reference

Bun provides a simple, modern API for file I/O that is much more ergonomic than
the Node.js `fs` module. The starting point is `Bun.file(path)`, which creates a
**BunFile** reference:

```typescript
const file = Bun.file("data.json");
```

This is **lazy** -- it does not actually read the file from disk. It just creates
a reference that you can use to perform operations later. This design means you
can pass file references around without triggering any I/O until you need it.

### Reading File Contents

Once you have a BunFile reference, you can read its contents using several async
methods:

```typescript
const file = Bun.file("data.json");

// Read as plain text
const text: string = await file.text();

// Read and parse as JSON
const data: unknown = await file.json();

// Read as raw binary data
const buffer: ArrayBuffer = await file.arrayBuffer();
```

All of these methods return Promises, so you must `await` them. Each method reads
the entire file into memory.

### Type-Safe JSON Reading

TypeScript generics let you specify the expected shape of your JSON data:

```typescript
interface Config {
  port: number;
  host: string;
}

const config = await Bun.file("config.json").json() as Config;
// config.port is now typed as number
```

You can also write a generic helper function to make this pattern reusable, which
is exactly what you will do in this exercise.

### Checking File Existence

Before reading a file, you may want to verify it exists. BunFile provides an
async `.exists()` method:

```typescript
const file = Bun.file("maybe-here.txt");
const exists: boolean = await file.exists();

if (exists) {
  const content = await file.text();
  console.log(content);
} else {
  console.log("File not found");
}
```

### Writing Files with Bun.write()

To write data to a file, use `Bun.write(path, data)`:

```typescript
// Write a string to a file
await Bun.write("output.txt", "Hello World");

// Write JSON with formatting
const obj = { name: "Bun", version: 1 };
await Bun.write("data.json", JSON.stringify(obj, null, 2));

// Write binary data
const bytes = new Uint8Array([72, 101, 108, 108, 111]);
await Bun.write("binary.dat", bytes);
```

`Bun.write()` creates the file if it does not exist and overwrites it if it does.
It also creates any missing parent directories automatically.

### Comparison with Node.js

In Node.js, you would typically use the `fs` module:

```typescript
// Node.js way
import { readFile, writeFile } from "fs/promises";

const text = await readFile("data.json", "utf-8");
const data = JSON.parse(text);

await writeFile("output.json", JSON.stringify(data, null, 2));
```

Bun's approach is simpler:

```typescript
// Bun way
const data = await Bun.file("data.json").json();

await Bun.write("output.json", JSON.stringify(data, null, 2));
```

Fewer imports, fewer steps, and the BunFile reference gives you a clean object
to work with.

---

## Quick Reference

```typescript
// Creating a file reference (lazy, no I/O)
const file = Bun.file("data.json");

// Reading contents (async)
const exists: boolean = await file.exists();
const text: string = await file.text();
const json: unknown = await file.json();
const buffer: ArrayBuffer = await file.arrayBuffer();

// File metadata
const size: number = file.size;
const type: string = file.type;  // MIME type

// Writing files (async)
await Bun.write("output.txt", "Hello World");
await Bun.write("data.json", JSON.stringify(obj, null, 2));
```

---

## Your Task

Implement the following four functions in `exercise.ts`:

### 1. `readJsonFile<T>(path: string): Promise<T>`

Read a JSON file and return the parsed data with the generic type `T`. If the
file does not exist, throw an `Error` with the message `"File not found: {path}"`,
where `{path}` is the actual path string passed to the function.

### 2. `writeJsonFile(path: string, data: unknown): Promise<void>`

Write data to a JSON file with 2-space indentation. Use `Bun.write()` combined
with `JSON.stringify()`.

### 3. `fileExists(path: string): Promise<boolean>`

Check if a file exists at the given path. Return `true` if it does, `false`
otherwise. Use `Bun.file(path).exists()`.

### 4. `appendToLog(path: string, message: string): Promise<void>`

Append a timestamped line to a log file. Each line should follow this format:

```
[ISO_TIMESTAMP] message\n
```

For example:

```
[2024-01-15T10:30:00.000Z] Server started
```

If the file does not exist, create it. If it does exist, read the current content
and append the new line to the end.

---

## Hints

- All file operations in Bun are async. Make sure to `await` every call.
- Use `new Date().toISOString()` for the ISO timestamp.
- For `appendToLog`, you need to read the existing content first (if any), then
  write back the combined result. Bun does not have a built-in append method, so
  you handle it manually.
- The tests use temporary directories created with `mkdtemp()` so your test files
  do not pollute the project directory. Each test gets a fresh temp directory that
  is cleaned up automatically.

---

## Running Tests

```bash
# Run the tests against your exercise
bun test exercise.test.ts

# Run the tests against the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```
