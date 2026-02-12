/**
 * Chapter 11.4 - Configuration for Production
 */

interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: string;
}

// TODO: Implement getProductionConfig(env)
// Takes env vars record, returns AppConfig
// No defaults for critical values - they must be provided
export function getProductionConfig(env: Record<string, string | undefined>): AppConfig {
  throw new Error("Not implemented");
}

// TODO: Implement validateProductionConfig(config)
// Stricter validation for production:
// - JWT secret must be >= 32 chars and not contain "default" or "change-me"
// - Database URL required and must start with postgres://
// - Port must be valid
// Returns array of error messages
export function validateProductionConfig(config: AppConfig): string[] {
  throw new Error("Not implemented");
}

// TODO: Implement getDevelopmentConfig(env)
// Development-friendly defaults for all values
export function getDevelopmentConfig(env: Record<string, string | undefined>): AppConfig {
  throw new Error("Not implemented");
}
