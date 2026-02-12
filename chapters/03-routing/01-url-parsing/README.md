# 3.1 URL Parsing

## Learning Objectives

By the end of this lesson you will be able to:

- Parse URLs using the Web Standard `URL` API
- Extract path segments from a URL pathname
- Work with query parameters via `URLSearchParams`
- Build URLs programmatically from component parts

---

## The `URL` Class

The `URL` class is a **Web Standard** API. It works identically in Bun, Node.js, Deno, and every modern browser. When you build HTTP servers with Bun, every incoming `Request` object has a `.url` property that contains the full URL string. The `URL` class is how you break that string into usable pieces.

### Creating a URL Object

```typescript
const url = new URL("http://localhost:3000/api/projects?page=1&limit=10");
```

This single constructor call gives you access to every component of the URL.

---

## URL Properties

### `url.pathname`

The path portion of the URL, starting with `/`. Query strings and fragments are excluded.

```typescript
const url = new URL("http://localhost:3000/api/projects?page=1");
console.log(url.pathname); // "/api/projects"
```

The pathname always starts with `/`. For a root URL like `http://localhost:3000`, the pathname is `"/"`.

### `url.searchParams`

A `URLSearchParams` instance that provides methods for reading and manipulating query parameters.

```typescript
const url = new URL("http://localhost:3000/api?page=1&limit=10&sort=name");

url.searchParams.get("page");    // "1"
url.searchParams.get("limit");   // "10"
url.searchParams.has("sort");    // true
url.searchParams.get("missing"); // null
```

`URLSearchParams` is iterable, so you can loop over all parameters:

```typescript
for (const [key, value] of url.searchParams) {
  console.log(`${key} = ${value}`);
}
// page = 1
// limit = 10
// sort = name
```

### `url.origin`

The scheme plus host plus port, combined into one string.

```typescript
const url = new URL("http://localhost:3000/api/projects");
console.log(url.origin); // "http://localhost:3000"
```

### `url.host` and `url.hostname`

`host` includes the port; `hostname` does not.

```typescript
const url = new URL("http://localhost:3000/api");
console.log(url.host);     // "localhost:3000"
console.log(url.hostname);  // "localhost"
```

### `url.protocol`

The scheme portion, including the trailing colon.

```typescript
const url = new URL("https://example.com/api");
console.log(url.protocol); // "https:"
```

---

## Splitting Pathname into Segments

A common routing task is to split the pathname into an array of segments. The key technique is to split on `"/"` and filter out empty strings (caused by leading slashes, trailing slashes, or accidental double slashes).

```typescript
const url = new URL("http://localhost:3000/api/projects/123");
const segments = url.pathname.split("/").filter((s) => s.length > 0);
console.log(segments); // ["api", "projects", "123"]
```

Why filter? Because `"/api/projects/123".split("/")` produces `["", "api", "projects", "123"]`. The leading slash creates an empty string at index 0.

Edge cases:

```typescript
"/".split("/").filter(Boolean);              // []
"/api//projects/".split("/").filter(Boolean); // ["api", "projects"]
```

---

## Building URLs with Query Parameters

The `URL` constructor accepts a second argument -- a base URL. This lets you construct a URL from separate parts:

```typescript
const url = new URL("/api/tasks", "http://localhost:3000");
console.log(url.toString()); // "http://localhost:3000/api/tasks"
```

You can then add query parameters programmatically using `searchParams.set()`:

```typescript
const url = new URL("/api/tasks", "http://localhost:3000");
url.searchParams.set("status", "done");
url.searchParams.set("page", "1");
console.log(url.toString());
// "http://localhost:3000/api/tasks?status=done&page=1"
```

This approach is preferable to string concatenation because `URLSearchParams` handles encoding automatically.

---

## URL Encoding and Decoding

Special characters in query values are automatically encoded by `URLSearchParams`:

```typescript
const url = new URL("http://localhost:3000/api");
url.searchParams.set("name", "hello world");
console.log(url.toString());
// "http://localhost:3000/api?name=hello+world"
```

When you read them back, they are automatically decoded:

```typescript
const url = new URL("http://localhost:3000/api?name=hello%20world");
console.log(url.searchParams.get("name")); // "hello world"
```

You can also use the standalone functions `encodeURIComponent` and `decodeURIComponent` for manual encoding when needed, but in most cases `URLSearchParams` handles it for you.

---

## Key API Summary

| Property / Method               | Returns                        | Example Output                  |
| -------------------------------- | ------------------------------ | ------------------------------- |
| `url.pathname`                   | Path string                    | `"/api/projects"`               |
| `url.searchParams`              | `URLSearchParams` instance     | iterable of `[key, value]`      |
| `url.searchParams.get(key)`     | `string \| null`               | `"1"` or `null`                 |
| `url.searchParams.set(key, v)`  | `void` (mutates URL)           | --                              |
| `url.searchParams.has(key)`     | `boolean`                      | `true`                          |
| `url.origin`                     | Scheme + host + port           | `"http://localhost:3000"`       |
| `url.host`                       | Host with port                 | `"localhost:3000"`              |
| `url.hostname`                   | Host without port              | `"localhost"`                   |
| `url.protocol`                   | Scheme with colon              | `"http:"`                       |
| `url.toString()`                | Full URL string                | `"http://localhost:3000/api"`   |

---

## Your Task

Implement the following four pure functions in `exercise.ts`:

### 1. `parsePath(url: string): string`

Extract the pathname from a full URL string.

```typescript
parsePath("http://localhost:3000/api/projects"); // "/api/projects"
parsePath("http://localhost:3000/");             // "/"
parsePath("http://localhost:3000/api?page=1");   // "/api"
```

### 2. `parseSegments(url: string): string[]`

Split the URL pathname into an array of segments. Filter out empty strings.

```typescript
parseSegments("http://localhost:3000/api/projects/123"); // ["api", "projects", "123"]
parseSegments("http://localhost:3000/");                 // []
parseSegments("http://localhost:3000/api//projects/");   // ["api", "projects"]
```

### 3. `parseQueryParams(url: string): Record<string, string>`

Extract all query parameters as a plain key-value object.

```typescript
parseQueryParams("http://localhost:3000/api?page=1&limit=10");
// { page: "1", limit: "10" }

parseQueryParams("http://localhost:3000/api");
// {}
```

### 4. `buildUrl(base: string, path: string, params?: Record<string, string>): string`

Build a complete URL from a base, a path, and optional query parameters.

```typescript
buildUrl("http://localhost:3000", "/api/projects");
// "http://localhost:3000/api/projects"

buildUrl("http://localhost:3000", "/api/tasks", { status: "done", page: "1" });
// "http://localhost:3000/api/tasks?status=done&page=1"
```

---

## Running Tests

```bash
# Test your exercise
bun test exercise.test.ts

# Test the solution
TEST_SOLUTION=1 bun test exercise.test.ts
```
