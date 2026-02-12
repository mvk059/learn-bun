/**
 * Chapter 1.3 - Environment Configuration (Solution)
 */

export interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: "development" | "production" | "test";
}

export function getConfig(): AppConfig {
  const portStr = process.env.PORT;
  const port = portStr ? parseInt(portStr, 10) : NaN;

  return {
    port: Number.isNaN(port) ? 3000 : port,
    databaseUrl: process.env.DATABASE_URL ?? "postgres://localhost:5432/taskmanager",
    jwtSecret: process.env.JWT_SECRET ?? "default-dev-secret-change-me-in-production!!",
    nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development",
  };
}

export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  if (config.jwtSecret.length < 32) {
    errors.push("JWT secret must be at least 32 characters long");
  }

  if (config.port < 1 || config.port > 65535) {
    errors.push("Port must be between 1 and 65535");
  }

  if (!config.databaseUrl.startsWith("postgres://") && !config.databaseUrl.startsWith("postgresql://")) {
    errors.push("Database URL must start with postgres:// or postgresql://");
  }

  return errors;
}
