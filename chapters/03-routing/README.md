# Chapter 3: Routing

This chapter covers how to route incoming HTTP requests to the correct handler. You will parse URLs, match HTTP methods, extract path and query parameters, and build a reusable router module.

## Lessons

1. **URL Parsing** - Breaking apart request URLs into pathname and search components.
2. **Method Routing** - Dispatching requests based on HTTP methods (GET, POST, PUT, DELETE).
3. **Path Parameters** - Defining dynamic route segments and extracting their values.
4. **Query Parameters** - Reading and validating query string parameters.
5. **Router Module** - Combining all routing logic into a clean, composable module.

## What You'll Learn

- How to parse and decompose URLs in request handlers.
- How to branch logic based on HTTP methods.
- How to capture dynamic values from URL paths.
- How to extract and use query string parameters.
- How to organize routing into a standalone, reusable module.

## Prerequisites

- [Chapter 1: Setting Up the App](../01-setup/) - Project setup and TypeScript configuration.
- [Chapter 2: Basic Server](../02-basic-server/) - HTTP server fundamentals and request/response handling.
