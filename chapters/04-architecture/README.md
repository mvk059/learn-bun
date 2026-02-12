# Chapter 4: Architecture

This chapter focuses on organizing your growing codebase into a maintainable structure. You will separate concerns into handlers, services, and middleware layers.

## Lessons

1. **Project Structure** - Establishing a directory layout that scales with your application.
2. **Handlers** - Writing handler functions that receive requests and return responses.
3. **Services** - Extracting business logic into service modules independent of HTTP.
4. **Middleware** - Creating reusable middleware for cross-cutting concerns like logging and timing.

## What You'll Learn

- How to structure a Bun project for long-term maintainability.
- How to separate HTTP concerns (handlers) from business logic (services).
- How to write middleware that wraps handlers transparently.
- How the handler-service-middleware pattern keeps each layer testable in isolation.

## Prerequisites

- [Chapter 1: Setting Up the App](../01-setup/) - Project setup and configuration.
- [Chapter 2: Basic Server](../02-basic-server/) - HTTP server basics.
- [Chapter 3: Routing](../03-routing/) - Request routing and URL handling.
