import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { jsonResponse, errorResponse, redirectResponse, htmlResponse, noContentResponse } = await import(MODULE);

describe("Response Building", () => {
  describe("jsonResponse", () => {
    test("returns 200 by default", () => {
      const res = jsonResponse({ message: "ok" });
      expect(res.status).toBe(200);
    });

    test("sets Content-Type to application/json", () => {
      const res = jsonResponse({ message: "ok" });
      expect(res.headers.get("content-type")).toContain("application/json");
    });

    test("body contains JSON data", async () => {
      const data = { id: 1, name: "Test" };
      const res = jsonResponse(data);
      const body = await res.json();
      expect(body).toEqual(data);
    });

    test("accepts custom status code", () => {
      const res = jsonResponse({ created: true }, 201);
      expect(res.status).toBe(201);
    });

    test("handles arrays", async () => {
      const data = [1, 2, 3];
      const res = jsonResponse(data);
      const body = await res.json();
      expect(body).toEqual([1, 2, 3]);
    });
  });

  describe("errorResponse", () => {
    test("returns specified status code", () => {
      const res = errorResponse("Not found", 404);
      expect(res.status).toBe(404);
    });

    test("body has error field", async () => {
      const res = errorResponse("Bad request", 400);
      const body = await res.json();
      expect(body.error).toBe("Bad request");
    });

    test("sets Content-Type to application/json", () => {
      const res = errorResponse("Error", 500);
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("redirectResponse", () => {
    test("returns 302 by default (temporary)", () => {
      const res = redirectResponse("https://example.com");
      expect(res.status).toBe(302);
    });

    test("returns 301 when permanent is true", () => {
      const res = redirectResponse("https://example.com", true);
      expect(res.status).toBe(301);
    });

    test("sets Location header", () => {
      const res = redirectResponse("https://example.com/new");
      expect(res.headers.get("location")).toBe("https://example.com/new");
    });
  });

  describe("htmlResponse", () => {
    test("returns 200 status", () => {
      const res = htmlResponse("<h1>Hello</h1>");
      expect(res.status).toBe(200);
    });

    test("sets Content-Type to text/html", () => {
      const res = htmlResponse("<h1>Hello</h1>");
      expect(res.headers.get("content-type")).toContain("text/html");
    });

    test("body contains HTML", async () => {
      const html = "<h1>Task Manager</h1>";
      const res = htmlResponse(html);
      const body = await res.text();
      expect(body).toBe(html);
    });
  });

  describe("noContentResponse", () => {
    test("returns 204 status", () => {
      const res = noContentResponse();
      expect(res.status).toBe(204);
    });

    test("has no body", async () => {
      const res = noContentResponse();
      const body = await res.text();
      expect(body).toBe("");
    });
  });
});
