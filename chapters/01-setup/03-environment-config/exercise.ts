/**
 * Chapter 1.3 - Environment Configuration
 *
 * Learn to use Bun.env for typed configuration.
 */

// TODO: Define the AppConfig interface
// Fields: port (number), databaseUrl (string), jwtSecret (string),
//         nodeEnv ("development" | "production" | "test")
export interface AppConfig {
  // Add fields here
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: "development" | "production" | "test";
}

// TODO: Implement getConfig()
// Read from Bun.env (which is the same as process.env in Bun) with these defaults:
//   PORT -> port (number, default: 3000) - if PORT is not a valid number, use default
//   DATABASE_URL -> databaseUrl (default: "postgres://localhost:5432/taskmanager")
//   JWT_SECRET -> jwtSecret (default: "default-dev-secret-change-me-in-production!!")
//   NODE_ENV -> nodeEnv (default: "development")
export function getConfig(): AppConfig {
  throw new Error("Not implemented");
}

// TODO: Implement validateConfig()
// Return an array of error message strings. Empty array = valid config.
// Rules:
//   - JWT secret must be at least 32 characters
//   - Port must be between 1 and 65535
//   - Database URL must start with "postgres://" or "postgresql://"
export function validateConfig(config: AppConfig): string[] {
  throw new Error("Not implemented");
}
