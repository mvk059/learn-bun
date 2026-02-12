# Chapter 8: Authentication & Authorization

This chapter secures your API with user authentication and role-based access control. You will hash passwords, register users, issue JWTs, protect routes with middleware, manage accounts, and enforce permissions.

## Lessons

1. **Passwords** - Hashing and verifying passwords securely using modern algorithms.
2. **Registration** - Creating new user accounts with validated input and secure password storage.
3. **JWT** - Generating and verifying JSON Web Tokens for stateless authentication.
4. **Login** - Authenticating users with credentials and returning access tokens.
5. **Auth Middleware** - Protecting routes by verifying tokens and attaching user context to requests.
6. **Account Management** - Allowing users to view and update their own account details.
7. **RBAC** - Implementing role-based access control to restrict actions by user role.

## What You'll Learn

- How to hash and verify passwords without storing them in plain text.
- How to build registration and login flows for your API.
- How to issue and validate JWTs for stateless session management.
- How to write middleware that guards protected endpoints.
- How to let users manage their own accounts securely.
- How to enforce role-based permissions across your API.

## Prerequisites

- [Chapter 4: Architecture](../04-architecture/) - Handlers, services, and middleware patterns.
- [Chapter 5: JSON Handling](../05-json-handling/) - JSON parsing and validation.
- [Chapter 6: Error Handling](../06-error-handling/) - Error classes and HTTP semantics.
- [Chapter 7: Storage](../07-storage/) - Database access, repositories, and transactions.
