/**
 * Chapter 11.3 - Dockerfile (Solution)
 */

export function generateDockerfile(): string {
  return `FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Run
CMD ["bun", "run", "start"]
`;
}

export function generateDockerignore(): string {
  return `node_modules
.git
.gitignore
*.md
.env
.env.local
.env.test
dist
chapters
`;
}
