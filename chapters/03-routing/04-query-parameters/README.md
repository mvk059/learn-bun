# 3.4 Query Parameters

## Learning Objectives

By the end of this lesson you will be able to:

- Parse pagination parameters (`page`, `limit`) from a URL's query string
- Implement sorting via `sort` and `order` query parameters
- Apply pagination (slicing) to arrays of any type
- Handle invalid or missing query values with safe defaults and clamping

---

## Concepts

### Why Query Parameters?

When an API returns a collection of resources -- say, a list of blog posts or
users -- the client usually needs control over **which** items come back and in
**what order**. Query parameters are the standard mechanism for this:

```
GET /api/posts?page=2&limit=20&sort=title&order=desc
```

The four parameters above cover two concerns:

| Concern    | Parameters        | Purpose                              |
|------------|-------------------|--------------------------------------|
| Pagination | `page`, `limit`   | Which slice of the data to return    |
| Sorting    | `sort`, `order`   | How to order the data before slicing |

### Pagination Parameters

**`page`** -- the 1-based page number the client wants (default: `1`).

**`limit`** (sometimes called `pageSize`) -- how many items per page
(default: `10`).

From these two values you can derive the **offset** into the full list:

```
offset = (page - 1) * limit
```

For example, `page=3` with `limit=10` gives `offset = 20`, so you return
items 21 through 30.

### Safe Defaults and Clamping

Never trust raw user input. A client could send `limit=999999` and blow up
your response size, or `page=-5` which makes no sense. Protect yourself with
**clamping**:

| Parameter | Minimum | Maximum | Default |
|-----------|---------|---------|---------|
| `page`    | 1       | --      | 1       |
| `limit`   | 1       | 100     | 10      |

If the value is missing, non-numeric, or out of range, fall back to the
default or clamp it to the nearest boundary.

```typescript
let limit = parseInt(params.get("limit") ?? "10", 10);
if (isNaN(limit) || limit < 1) limit = 1;
if (limit > 100) limit = 100;
```

### Sorting Parameters

**`sort`** -- the name of the field to sort by (default: `"createdAt"`).

**`order`** -- either `"asc"` (ascending) or `"desc"` (descending).
Any other value should fall back to `"asc"`.

When comparing values in the sort function, handle both strings and numbers:

- **Strings**: use `localeCompare` for proper alphabetical ordering.
- **Numbers**: use simple less-than / greater-than comparison.

For descending order, negate the comparison result.

### Generic Utility Functions

Pagination and sorting are not tied to a specific data type. By writing
**generic functions** (`applyPagination<T>`, `applySort<T>`) you can reuse
them across every collection endpoint in your API -- posts, users, comments,
etc.

```typescript
// Works with any array
const pagedUsers = applyPagination(users, { page: 2, limit: 10 });
const sortedPosts = applySort(posts, { field: "title", order: "asc" });
```

### Extracting Query Parameters in Bun

Bun's `Request` object gives you the full URL. Use the built-in `URL` class
to parse it, then read parameters from `searchParams`:

```typescript
const url = new URL(request.url);
const page = url.searchParams.get("page");   // string | null
const limit = url.searchParams.get("limit"); // string | null
```

`searchParams.get()` returns `null` when the parameter is absent, so always
provide a fallback before parsing to a number.

### Putting It All Together

A typical handler combines parsing and applying in sequence:

```typescript
function handleListRequest(request: Request, allItems: Item[]) {
  const pagination = parsePagination(request.url);
  const sort = parseSort(request.url);

  const sorted = applySort(allItems, sort);
  const paged = applyPagination(sorted, pagination);

  return Response.json({
    data: paged,
    page: pagination.page,
    limit: pagination.limit,
    total: allItems.length,
  });
}
```

Notice the order: **sort first, then paginate**. If you paginate before
sorting you will sort only the current page, not the full dataset.

---

## Your Task

Create the following types and functions:

1. **`PaginationOptions`** type with fields `page: number` and
   `limit: number`.

2. **`SortOptions`** type with fields `field: string` and
   `order: "asc" | "desc"`.

3. **`parsePagination(url: string): PaginationOptions`**
   - Use `new URL(url).searchParams` to read `page` and `limit`.
   - Default `page` to `1` and `limit` to `10`.
   - If the value is non-numeric (`isNaN`), use the default.
   - Clamp `page` to a minimum of `1`.
   - Clamp `limit` to the range `1 - 100`.

4. **`parseSort(url: string): SortOptions`**
   - Read `sort` (default `"createdAt"`) and `order` (default `"asc"`).
   - Only accept `"asc"` or `"desc"` for order; anything else becomes
     `"asc"`.

5. **`applyPagination<T>(items: T[], options: PaginationOptions): T[]`**
   - Calculate `offset = (page - 1) * limit`.
   - Return `items.slice(offset, offset + limit)`.

6. **`applySort<T>(items: T[], sort: SortOptions): T[]`**
   - Return a **new** sorted array (do not mutate the original).
   - Compare values at `sort.field` on each element.
   - Use `localeCompare` for strings, numeric comparison otherwise.
   - Negate the comparison when `order` is `"desc"`.

---

## Running Tests

```bash
# Test your exercise
bun test exercise.test.ts

# Test the provided solution
TEST_SOLUTION=1 bun test exercise.test.ts
```

## Key Takeaways

- Always provide safe defaults for query parameters -- never assume the
  client sends valid values.
- Clamp numeric parameters to sensible ranges to protect your server.
- Sort **before** you paginate so the client gets a consistent, ordered view
  of the data.
- Generic helper functions (`applyPagination<T>`, `applySort<T>`) keep your
  route handlers clean and DRY.
