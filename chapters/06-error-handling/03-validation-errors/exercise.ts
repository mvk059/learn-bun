/**
 * Chapter 6.3 - Validation Errors
 *
 * Connect validation logic to the error handling system.
 */

// TODO: Implement validateOrThrow<T>
// Takes input data and a validator function (returns string[] of errors)
// If errors array is empty, return the input data
// If errors exist, throw an error with statusCode 400 and details: { errors }
// (Use an object with statusCode and details properties)
export function validateOrThrow<T>(
  input: T,
  validator: (input: T) => string[]
): T {
  throw new Error("Not implemented");
}

// TODO: Implement withValidation
// Takes a validator function and a handler function
// Returns a new handler that:
// 1. Parses JSON body from request (handle parse errors -> 400)
// 2. Runs validator on parsed body
// 3. If validation errors: return 400 JSON { errors: [...] }
// 4. If valid: call the handler with (req, validatedData)
export function withValidation<T>(
  validator: (input: any) => string[],
  handler: (req: Request, data: T) => Response | Promise<Response>
): (req: Request) => Promise<Response> {
  throw new Error("Not implemented");
}
