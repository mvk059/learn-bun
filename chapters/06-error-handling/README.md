# Chapter 6: Error Handling

This chapter establishes a robust error-handling strategy for your API. You will create custom error classes, build a global error handler, manage validation errors, and apply correct HTTP semantics.

## Lessons

1. **Error Classes** - Defining custom error types for not-found, conflict, and other domain errors.
2. **Global Handler** - Catching unhandled errors in a centralized handler that returns consistent responses.
3. **Validation Errors** - Collecting and reporting multiple validation failures in a single response.
4. **HTTP Semantics** - Mapping error types to appropriate HTTP status codes and response formats.

## What You'll Learn

- How to create a hierarchy of application-specific error classes.
- How to implement a global error handler that prevents unhandled crashes.
- How to aggregate validation errors and return them in a structured format.
- How to choose the right HTTP status codes for different error scenarios.

## Prerequisites

- [Chapter 1: Setting Up the App](../01-setup/) - Project setup and TypeScript types.
- [Chapter 3: Routing](../03-routing/) - Routing and request handling.
- [Chapter 4: Architecture](../04-architecture/) - Handlers, services, and middleware.
- [Chapter 5: JSON Handling](../05-json-handling/) - JSON parsing and CRUD endpoints.
