# 6.3 Validation Errors

## What You'll Learn

- How to connect validation logic to a structured error handling system
- Building a `validateOrThrow` helper that bridges validators and HTTP errors
- Creating a `withValidation` middleware for request handlers
- Establishing a clean pattern for validation throughout your API

## Why Validation Errors Need Structure

In the previous lessons, you built an `HttpError` class and a global error handler. Now
it is time to address one of the most common sources of errors in any web API: input
validation.

Validation errors are unique because they carry extra context. A generic 400 status code
tells the client "you sent a bad request," but it does not tell them *what* was wrong.
Structured validation errors include a list of specific field-level problems so the client
can display meaningful feedback to end users.

Without a structured approach, validation handling ends up scattered across every route:

```typescript
// Repetitive and inconsistent
if (!body.name) {
  return Response.json({ error: "Name required" }, { status: 400 });
}
if (!body.email) {
  return Response.json({ error: "Email required" }, { status: 400 });
}
```

A better pattern centralizes this into reusable pieces.

## Core Concept: The Validator Function

A validator function takes input data and returns an array of error strings. An empty
array means the input is valid:

```typescript
type Validator<T> = (input: T) => string[];

const validateUser: Validator<any> = (input) => {
  const errors: string[] = [];
  if (!input.name || typeof input.name !== "string") {
    errors.push("Name is required and must be a string");
  }
  if (!input.email || !input.email.includes("@")) {
    errors.push("A valid email is required");
  }
  return errors;
};
```

This pattern is framework-agnostic. The validator knows nothing about HTTP, requests, or
responses. It simply inspects data and reports problems.

## The validateOrThrow Helper

The `validateOrThrow` function bridges the gap between a pure validator and the error
handling system. It runs the validator and either returns the valid data or throws a
structured error:

```typescript
function validateOrThrow<T>(input: T, validator: Validator<T>): T {
  const errors = validator(input);
  if (errors.length > 0) {
    // Throw an error with statusCode and details
    // Your global error handler can catch this
    throw new BadRequestError("Validation failed", { errors });
  }
  return input;
}
```

The thrown error should include:
- A `statusCode` of 400 (Bad Request)
- A `details` object containing the array of validation errors

This integrates seamlessly with the global error handler from Lesson 6.2. When
`validateOrThrow` throws, the error handler catches it, reads the `statusCode`, and
returns a proper JSON response.

## The withValidation Middleware

For HTTP handlers, you often want to parse the request body, validate it, and only then
run the business logic. The `withValidation` function wraps this entire flow:

```typescript
const handler = withValidation(validateUser, async (req, validData) => {
  // validData is guaranteed to have passed validation
  const user = await saveUser(validData);
  return Response.json(user, { status: 201 });
});
```

The middleware handles three scenarios:

1. **JSON parse failure** - The request body is not valid JSON. Return a 400 response
   with a clear message.

2. **Validation failure** - The parsed data fails validation. Return a 400 response
   with the list of specific errors.

3. **Validation success** - Pass the validated data to the inner handler function.

This keeps your route handlers clean. They only deal with valid data.

## Error Response Format

When validation fails, the response should follow a consistent JSON envelope:

```json
{
  "errors": [
    "Name is required",
    "Email must contain @"
  ]
}
```

Clients can iterate over this array to display field-level feedback. This format is
simple, predictable, and easy to consume from any frontend framework.

## Composing Validators

Because validators are plain functions returning string arrays, they compose naturally:

```typescript
const validateProject = (input: any): string[] => {
  return [
    ...validateRequired(input, "name"),
    ...validateRequired(input, "description"),
    ...validateLength(input.name, "name", 3, 100),
  ];
};
```

Each sub-validator returns its own array of errors, and you spread them together. This
keeps individual validation rules small and testable.

## How It Fits the Error Hierarchy

The flow from validation to response looks like this:

```
Request Body
  -> JSON parse (catch SyntaxError -> 400)
  -> Validator function (returns string[])
  -> Errors found? -> 400 with { errors: [...] }
  -> No errors? -> Handler receives validated data
```

When using `validateOrThrow` directly (outside the middleware), the thrown error flows
through the global error handler from Lesson 6.2, which reads `statusCode` and `details`
to build the response.

## Exercise

Open `exercise.ts` and implement:

1. **`validateOrThrow<T>(input, validator)`** - Run the validator. If errors exist, throw
   an error object with `statusCode: 400` and `details: { errors }`. If no errors, return
   the input data unchanged.

2. **`withValidation<T>(validator, handler)`** - Return an async function that takes a
   `Request`, parses its JSON body, runs the validator, and either returns a 400 error
   response or calls the handler with the validated data.

Run the tests with:

```bash
bun test exercise.test.ts
```

Check the solution when ready:

```bash
TEST_SOLUTION=1 bun test exercise.test.ts
```

## Key Takeaways

- Validators are pure functions: `(input) => string[]`. They know nothing about HTTP.
- `validateOrThrow` bridges validators and the error system by throwing structured errors.
- `withValidation` is middleware that handles JSON parsing, validation, and error responses.
- Consistent error envelopes (`{ errors: [...] }`) make client-side error handling simple.
- This pattern eliminates scattered validation logic across route handlers.
