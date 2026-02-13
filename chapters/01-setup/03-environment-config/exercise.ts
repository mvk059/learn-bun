/**
 * Chapter 1.3 - Environment Configuration
 *
 * Learn to use Bun.env for typed configuration.
 */

// Fields: port (number), databaseUrl (string), jwtSecret (string),
//         nodeEnv ("development" | "production" | "test")
export interface AppConfig {
  // Add fields here
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: "development" | "production" | "test";
}

// Read from Bun.env (which is the same as process.env in Bun) with these defaults:
//   PORT -> port (number, default: 3000) - if PORT is not a valid number, use default
//   DATABASE_URL -> databaseUrl (default: "postgres://localhost:5432/taskmanager")
//   JWT_SECRET -> jwtSecret (default: "default-dev-secret-change-me-in-production!!")
//   NODE_ENV -> nodeEnv (default: "development")
export function getConfig(): AppConfig {
  const portStr = Bun.env["PORT"];
  const port = portStr ? parseInt(portStr) : 3000;

  return {
    port: Number.isNaN(port) ? 3000 : port,
    databaseUrl: Bun.env["DATABASE_URL"] ?? "postgres://localhost:5432/taskmanager",
    jwtSecret: Bun.env["JWT_SECRET"] ?? "default-dev-secret-change-me-in-production!!",
    nodeEnv: (Bun.env["NODE_ENV"] as AppConfig["nodeEnv"]) ?? "development",
  };
}

// Return an array of error message strings. Empty array = valid config.
// Rules:
//   - JWT secret must be at least 32 characters
//   - Port must be between 1 and 65535
//   - Database URL must start with "postgres://" or "postgresql://"
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  if (config.jwtSecret.length < 32) {
    errors.push("JWT secret must be at least 32 characters");
  }

  if (config.port < 1 || config.port > 65535) {
    errors.push("Port must be between 1 and 65535");
  }

  if (!config.databaseUrl.startsWith("postgres://") && !config.databaseUrl.startsWith("postgresql://")) {
    errors.push("Database URL must start with postgres:// or postgresql://");
  }

  return errors
}
