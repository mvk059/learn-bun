/**
 * Chapter 11.2 - Structured Logging (Solution)
 */

export class Logger {
  constructor(private output: (msg: string) => void = console.log) {}

  private log(level: string, message: string, data?: Record<string, any>): void {
    this.output(JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    }));
  }

  info(message: string, data?: Record<string, any>): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: Record<string, any>): void {
    this.log("error", message, data);
  }
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}
