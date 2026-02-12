# 11.3 Dockerfile

## What You'll Learn

- How to containerize a Bun application with Docker
- Multi-stage builds for smaller production images
- Writing an effective `.dockerignore` file
- Integrating your app into a `docker-compose` setup

## Why Containerize?

Containers provide a consistent, reproducible environment for your application. The classic
"it works on my machine" problem disappears when your app runs in the same container image
everywhere -- development, CI, staging, and production.

For Bun applications, containerization also solves the problem of ensuring the correct Bun
version is installed on the deployment target. The container bundles the exact runtime your
app needs.

## The Official Bun Docker Image

Bun provides official Docker images at `oven/bun`. The image tags follow a predictable
pattern:

- `oven/bun:1` -- Latest Bun 1.x (recommended for production)
- `oven/bun:latest` -- Absolute latest release
- `oven/bun:1.1.0` -- Specific version pinned

For production, use a major version tag like `oven/bun:1` to get patch updates
automatically while avoiding breaking changes.

## Writing the Dockerfile

A well-structured Dockerfile for a Bun app follows this pattern:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

# Copy application source
COPY . .

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["bun", "run", "start"]
```

### Layer Caching

The order of `COPY` instructions matters. By copying `package.json` and `bun.lockb` before
the source code, Docker can cache the dependency installation layer. As long as your
dependencies do not change, rebuilds only need to copy the new source code -- saving
significant build time.

### Production Dependencies Only

The `--production` flag tells Bun to skip `devDependencies`. In production, you do not need
test frameworks, linters, or build tools. This reduces the image size and attack surface.

The `--frozen-lockfile` flag ensures the lockfile is not modified during install. If the
lockfile is out of sync with `package.json`, the build fails rather than silently updating
dependencies.

## Multi-Stage Builds

For even smaller images, use a multi-stage build that separates the build step from the
runtime:

```dockerfile
# Stage 1: Install dependencies
FROM oven/bun:1 AS install
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

# Stage 2: Production image
FROM oven/bun:1-slim AS production
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER bun
CMD ["bun", "run", "start"]
```

The `1-slim` variant is a smaller base image without extra build tools. The `USER bun`
instruction runs the process as a non-root user for better security.

## The .dockerignore File

A `.dockerignore` file tells Docker which files to exclude from the build context. This
speeds up builds and prevents sensitive or unnecessary files from ending up in the image.

```
node_modules
.git
.gitignore
*.md
.env
.env.local
.env.test
dist
```

Key exclusions:

- **node_modules**: Dependencies are installed inside the container; sending local
  `node_modules` wastes bandwidth and can cause platform mismatches
- **.git**: The Git history is not needed at runtime
- **.env files**: Environment variables should be injected at runtime, not baked into images
- **dist/build artifacts**: If you have a build step, it runs inside the container

## Docker Compose Integration

For local development with dependencies like PostgreSQL, add your Bun app to
`docker-compose.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5
```

The `depends_on` with `condition: service_healthy` ensures the database is ready before
your app starts.

## Building and Running

```bash
# Build the image
docker build -t my-bun-app .

# Run the container
docker run -p 3000:3000 --env-file .env my-bun-app

# Or with docker compose
docker compose up --build
```

## Best Practices

1. **Pin your base image** to a major version (`oven/bun:1`), not `latest`
2. **Copy dependency files first** for better layer caching
3. **Use `--production`** to skip devDependencies
4. **Use `--frozen-lockfile`** to catch lockfile drift
5. **Run as non-root** with `USER bun` in production
6. **Never bake secrets** into the image -- use environment variables at runtime
7. **Use `.dockerignore`** to keep the build context small and secure

## Exercise

Implement `generateDockerfile()` and `generateDockerignore()` functions that return valid
Dockerfile and .dockerignore content as strings for a Bun application.

## Key Takeaways

- The `oven/bun` image provides an official, optimized base for Bun applications
- Layer caching (copy package.json first, then source) dramatically speeds up rebuilds
- Multi-stage builds reduce final image size by separating install from runtime
- `.dockerignore` keeps builds fast and prevents sensitive files from entering the image
- Docker Compose ties your app together with databases and other services for local dev
