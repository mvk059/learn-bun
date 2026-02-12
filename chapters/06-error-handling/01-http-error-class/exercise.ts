/**
 * Chapter 6.1 - HTTP Error Class
 *
 * Custom error hierarchy for HTTP error handling.
 */

// TODO: Implement HttpError extending Error
// Properties: statusCode (number), message (string), details (any, optional)
export class HttpError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    // TODO: Set statusCode and details
    // Hint: Set this.name = "HttpError" for proper error identification
    throw new Error("Not implemented");
  }
}

// TODO: Implement BadRequestError (status 400)
export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request", details?: any) {
    throw new Error("Not implemented");
  }
}

// TODO: Implement UnauthorizedError (status 401)
export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized") {
    throw new Error("Not implemented");
  }
}

// TODO: Implement ForbiddenError (status 403)
export class ForbiddenError extends HttpError {
  constructor(message: string = "Forbidden") {
    throw new Error("Not implemented");
  }
}

// TODO: Implement NotFoundError (status 404)
// Constructor takes resource name and optional id
// Message format: "{resource} not found" or "{resource} with id '{id}' not found"
export class NotFoundError extends HttpError {
  constructor(resource: string, id?: string) {
    throw new Error("Not implemented");
  }
}

// TODO: Implement ConflictError (status 409)
export class ConflictError extends HttpError {
  constructor(message: string = "Conflict") {
    throw new Error("Not implemented");
  }
}

// TODO: Implement isHttpError type guard
export function isHttpError(error: unknown): error is HttpError {
  throw new Error("Not implemented");
}
