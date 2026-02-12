# Chapter 11: Deployment (Bonus)

This bonus chapter prepares your application for production. You will add health check endpoints, set up structured logging, containerize the app with Docker, and tune production configuration.

## Lessons

1. **Health Checks** - Exposing readiness and liveness endpoints for orchestrators and load balancers.
2. **Logging** - Implementing structured, leveled logging suitable for production environments.
3. **Docker** - Writing a Dockerfile and composing services to containerize your application.
4. **Production Config** - Tuning environment variables, connection pools, and security settings for production.

## What You'll Learn

- How to implement health check endpoints that report application and dependency status.
- How to produce structured JSON logs with configurable log levels.
- How to build a minimal Docker image for a Bun application.
- How to configure your app for a production environment with proper defaults and safeguards.

## Prerequisites

- [Chapter 1: Setting Up the App](../01-setup/) - Environment configuration.
- [Chapter 7: Storage](../07-storage/) - Database connection and migrations.
- [Chapter 8: Authentication & Authorization](../08-auth/) - Full application with auth in place.
