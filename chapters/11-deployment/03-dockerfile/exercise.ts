/**
 * Chapter 11.3 - Dockerfile
 */

// TODO: Implement generateDockerfile()
// Return a string containing a valid Dockerfile for a Bun app:
// - Use oven/bun as base image
// - Set WORKDIR
// - Copy package.json and bun.lockb first (for layer caching)
// - Run bun install --production
// - Copy source code
// - EXPOSE port
// - CMD to run the app
export function generateDockerfile(): string {
  throw new Error("Not implemented");
}

// TODO: Implement generateDockerignore()
// Return a string with files/dirs to exclude from Docker context
export function generateDockerignore(): string {
  throw new Error("Not implemented");
}
