# 11.4 Configuration for Production

## What You'll Learn

- How production configuration differs from development configuration
- Stricter validation rules for production environments
- Factory functions for environment-specific config
- Common pitfalls when managing secrets and configuration

## Development vs. Production Configuration

In development, convenience is king. You want sensible defaults so you can run the app
without setting up a dozen environment variables. In production, safety is paramount. Every
critical value must be explicitly provided and validated.

Consider a JWT secret:

- **Development**: A hardcoded default like `"dev-secret"` is fine. Nobody is attacking
  your localhost.
- **Production**: The secret must be long, unique, and never a default value. A weak or
  default secret in production means anyone can forge authentication tokens.

This asymmetry means you need different configuration strategies for each environment.

## The Configuration Object

Start with a typed interface for your configuration:

```typescript
interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  nodeEnv: string;
}
```

Typing your configuration catches errors at compile time and provides autocomplete in your
editor. Every config value has a clear name and type.

## Production Configuration Factory

The production factory is strict. It reads from environment variables and does not provide
fallback defaults for critical values:

```typescript
function getProductionConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    port: parseInt(env.PORT ?? "3000", 10) || 3000,
    databaseUrl: env.DATABASE_URL ?? "",
    jwtSecret: env.JWT_SECRET ?? "",
    nodeEnv: env.NODE_ENV ?? "production",
  };
}
```

Notice that `databaseUrl` and `jwtSecret` default to empty strings rather than usable
values. This is intentional -- the validation step will catch missing values and prevent
the app from starting with incomplete configuration.

## Production Validation

Validation for production should be aggressive. It is far better to fail at startup with a
clear error message than to run with a misconfiguration that causes subtle bugs or security
vulnerabilities.

```typescript
function validateProductionConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  // JWT secret must be strong
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    errors.push("JWT secret must be at least 32 characters in production");
  }
  if (config.jwtSecret.includes("default") || config.jwtSecret.includes("change-me")) {
    errors.push("JWT secret must not contain default placeholder values");
  }

  // Database URL must be present and valid
  if (!config.databaseUrl || !config.databaseUrl.startsWith("postgres://")) {
    errors.push("Database URL is required and must be a valid PostgreSQL URL");
  }

  // Port validation
  if (config.port < 1 || config.port > 65535) {
    errors.push("Port must be between 1 and 65535");
  }

  return errors;
}
```

### Fail Fast at Startup

Use validation at application startup to catch problems immediately:

```typescript
const config = getProductionConfig(process.env);
const errors = validateProductionConfig(config);

if (errors.length > 0) {
  console.error("Configuration errors:");
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
```

This pattern is called **fail fast**. The application refuses to start if configuration is
invalid, which prevents it from running in a broken state.

## Development Configuration Factory

The development factory provides generous defaults so developers can run the app with
minimal setup:

```typescript
function getDevelopmentConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    port: parseInt(env.PORT ?? "3000", 10) || 3000,
    databaseUrl: env.DATABASE_URL ?? "postgres://taskmanager:taskmanager@localhost:5432/taskmanager",
    jwtSecret: env.JWT_SECRET ?? "default-dev-secret-change-me-in-production!!",
    nodeEnv: env.NODE_ENV ?? "development",
  };
}
```

Every value has a working default. A new developer can clone the repo and run the app
without creating any configuration files.

## Choosing the Right Factory

At startup, select the factory based on the environment:

```typescript
function loadConfig(): AppConfig {
  const env = process.env.NODE_ENV ?? "development";

  if (env === "production") {
    const config = getProductionConfig(process.env);
    const errors = validateProductionConfig(config);
    if (errors.length > 0) {
      throw new Error(`Invalid production config:\n${errors.join("\n")}`);
    }
    return config;
  }

  return getDevelopmentConfig(process.env);
}
```

## Common Pitfalls

### 1. Secrets in Source Code

Never commit secrets to version control. Use environment variables or a secrets manager
(AWS Secrets Manager, HashiCorp Vault, Doppler).

### 2. Default Secrets in Production

A default JWT secret like `"change-me"` that accidentally runs in production is a critical
vulnerability. The validation step catches this.

### 3. Missing Validation

Without validation, the app starts but fails later when it tries to connect to a database
or verify a token. By then, it may have already accepted traffic and returned errors to
users.

### 4. Overly Permissive Defaults

If production config falls back to development defaults, a missing environment variable
silently uses an insecure value. Keep production strict.

## Environment Variable Best Practices

1. **Use `.env` files only in development** -- never in production
2. **Document all required variables** in a `.env.example` file
3. **Validate at startup** -- do not wait until a variable is first used
4. **Use typed parsing** -- `parseInt` for numbers, explicit checks for booleans
5. **Separate config by concern** -- database, auth, server, feature flags

## Exercise

Implement `getProductionConfig`, `validateProductionConfig`, and `getDevelopmentConfig`
functions that handle environment-specific configuration with appropriate defaults and
strict production validation.

## Key Takeaways

- Production and development configurations have fundamentally different requirements
- Production config should have no implicit defaults for security-critical values
- Validate production config at startup and fail fast with clear error messages
- Development config should have generous defaults for quick onboarding
- Never commit secrets to source control; use environment variables or secrets managers
- Typed configuration interfaces catch errors at compile time
