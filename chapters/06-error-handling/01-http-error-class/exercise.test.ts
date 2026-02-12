import { describe, test, expect } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { HttpError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, isHttpError } = await import(MODULE);

describe("HTTP Error Class", () => {
  describe("HttpError", () => {
    test("extends Error", () => {
      const err = new HttpError(400, "Bad Request");
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(HttpError);
    });

    test("has statusCode and message", () => {
      const err = new HttpError(500, "Server Error");
      expect(err.statusCode).toBe(500);
      expect(err.message).toBe("Server Error");
    });

    test("supports optional details", () => {
      const err = new HttpError(400, "Bad Request", { field: "name" });
      expect(err.details).toEqual({ field: "name" });
    });
  });

  describe("BadRequestError", () => {
    test("has status 400", () => {
      const err = new BadRequestError("Invalid input");
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe("Invalid input");
    });

    test("is instanceof HttpError", () => {
      expect(new BadRequestError("test")).toBeInstanceOf(HttpError);
    });
  });

  describe("UnauthorizedError", () => {
    test("has status 401", () => {
      const err = new UnauthorizedError("Not authenticated");
      expect(err.statusCode).toBe(401);
    });

    test("has default message", () => {
      const err = new UnauthorizedError();
      expect(err.message).toBe("Unauthorized");
    });
  });

  describe("ForbiddenError", () => {
    test("has status 403", () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe("Forbidden");
    });
  });

  describe("NotFoundError", () => {
    test("has status 404", () => {
      const err = new NotFoundError("Project");
      expect(err.statusCode).toBe(404);
    });

    test("formats message with resource name", () => {
      const err = new NotFoundError("Project");
      expect(err.message).toContain("Project");
      expect(err.message.toLowerCase()).toContain("not found");
    });

    test("includes id in message when provided", () => {
      const err = new NotFoundError("Project", "abc-123");
      expect(err.message).toContain("abc-123");
    });
  });

  describe("ConflictError", () => {
    test("has status 409", () => {
      const err = new ConflictError("Already exists");
      expect(err.statusCode).toBe(409);
    });
  });

  describe("isHttpError", () => {
    test("returns true for HttpError", () => {
      expect(isHttpError(new HttpError(400, "test"))).toBe(true);
    });

    test("returns true for subclasses", () => {
      expect(isHttpError(new NotFoundError("X"))).toBe(true);
      expect(isHttpError(new BadRequestError("X"))).toBe(true);
    });

    test("returns false for regular Error", () => {
      expect(isHttpError(new Error("test"))).toBe(false);
    });

    test("returns false for non-errors", () => {
      expect(isHttpError("string")).toBe(false);
      expect(isHttpError(null)).toBe(false);
    });
  });
});
