import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { parsePagination, parseSort, applyPagination, applySort } = await import(MODULE);

describe("Query Parameters", () => {
  describe("parsePagination", () => {
    test("returns defaults when no params", () => {
      const result = parsePagination("http://localhost:3000/api/projects");
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test("parses page and limit", () => {
      const result = parsePagination("http://localhost:3000/api?page=2&limit=20");
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    test("clamps limit to max 100", () => {
      const result = parsePagination("http://localhost:3000/api?limit=500");
      expect(result.limit).toBe(100);
    });

    test("clamps limit to min 1", () => {
      const result = parsePagination("http://localhost:3000/api?limit=0");
      expect(result.limit).toBe(1);
    });

    test("clamps page to min 1", () => {
      const result = parsePagination("http://localhost:3000/api?page=-1");
      expect(result.page).toBe(1);
    });

    test("handles non-numeric values with defaults", () => {
      const result = parsePagination("http://localhost:3000/api?page=abc&limit=xyz");
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe("parseSort", () => {
    test("returns defaults when no params", () => {
      const result = parseSort("http://localhost:3000/api");
      expect(result.field).toBe("createdAt");
      expect(result.order).toBe("asc");
    });

    test("parses sort field", () => {
      const result = parseSort("http://localhost:3000/api?sort=name");
      expect(result.field).toBe("name");
    });

    test("parses desc order", () => {
      const result = parseSort("http://localhost:3000/api?order=desc");
      expect(result.order).toBe("desc");
    });

    test("defaults invalid order to asc", () => {
      const result = parseSort("http://localhost:3000/api?order=invalid");
      expect(result.order).toBe("asc");
    });
  });

  describe("applyPagination", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    test("returns first page", () => {
      const result = applyPagination(items, { page: 1, limit: 10 });
      expect(result.length).toBe(10);
      expect(result[0].id).toBe(1);
      expect(result[9].id).toBe(10);
    });

    test("returns second page", () => {
      const result = applyPagination(items, { page: 2, limit: 10 });
      expect(result.length).toBe(10);
      expect(result[0].id).toBe(11);
    });

    test("returns partial last page", () => {
      const result = applyPagination(items, { page: 3, limit: 10 });
      expect(result.length).toBe(5);
      expect(result[0].id).toBe(21);
    });

    test("returns empty for out of range page", () => {
      const result = applyPagination(items, { page: 10, limit: 10 });
      expect(result.length).toBe(0);
    });

    test("handles custom limit", () => {
      const result = applyPagination(items, { page: 1, limit: 5 });
      expect(result.length).toBe(5);
    });
  });

  describe("applySort", () => {
    const items = [
      { name: "Charlie", age: 30 },
      { name: "Alice", age: 25 },
      { name: "Bob", age: 35 },
    ];

    test("sorts ascending by string field", () => {
      const result = applySort([...items], { field: "name", order: "asc" });
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Bob");
      expect(result[2].name).toBe("Charlie");
    });

    test("sorts descending by string field", () => {
      const result = applySort([...items], { field: "name", order: "desc" });
      expect(result[0].name).toBe("Charlie");
      expect(result[2].name).toBe("Alice");
    });

    test("sorts ascending by number field", () => {
      const result = applySort([...items], { field: "age", order: "asc" });
      expect(result[0].age).toBe(25);
      expect(result[2].age).toBe(35);
    });

    test("sorts descending by number field", () => {
      const result = applySort([...items], { field: "age", order: "desc" });
      expect(result[0].age).toBe(35);
      expect(result[2].age).toBe(25);
    });

    test("does not mutate original array", () => {
      const original = [...items];
      applySort(original, { field: "name", order: "asc" });
      expect(original[0].name).toBe("Charlie");
    });
  });
});
