/**
 * Chapter 11.4 - Configuration for Production (Solution)
 */

interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: string;
}

export function getProductionConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    port: parseInt(env.PORT ?? "3000", 10) || 3000,
    databaseUrl: env.DATABASE_URL ?? "",
    jwtSecret: env.JWT_SECRET ?? "",
    nodeEnv: env.NODE_ENV ?? "production",
  };
}

export function validateProductionConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    errors.push("JWT secret must be at least 32 characters in production");
  }
  if (config.jwtSecret.includes("default") || config.jwtSecret.includes("change-me")) {
    errors.push("JWT secret must not contain default placeholder values");
  }

  if (!config.databaseUrl || !config.databaseUrl.startsWith("postgres://")) {
    errors.push("Database URL is required and must be a valid PostgreSQL URL");
  }

  if (config.port < 1 || config.port > 65535) {
    errors.push("Port must be between 1 and 65535");
  }

  return errors;
}

export function getDevelopmentConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    port: parseInt(env.PORT ?? "3000", 10) || 3000,
    databaseUrl: env.DATABASE_URL ?? "postgres://taskmanager:taskmanager@localhost:5432/taskmanager",
    jwtSecret: env.JWT_SECRET ?? "default-dev-secret-change-me-in-production!!",
    nodeEnv: env.NODE_ENV ?? "development",
  };
}
