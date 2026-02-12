/**
 * Chapter 11.2 - Structured Logging
 */

// TODO: Implement Logger class
// Constructor takes an output function (default: console.log)
// Methods:
// - info(message: string, data?: Record<string, any>): void
// - warn(message: string, data?: Record<string, any>): void
// - error(message: string, data?: Record<string, any>): void
// Each outputs JSON string: { level, message, timestamp: ISO string, ...data }
export class Logger {
  constructor(private output: (msg: string) => void = console.log) {}

  info(message: string, data?: Record<string, any>): void {
    throw new Error("Not implemented");
  }

  warn(message: string, data?: Record<string, any>): void {
    throw new Error("Not implemented");
  }

  error(message: string, data?: Record<string, any>): void {
    throw new Error("Not implemented");
  }
}

// TODO: Implement generateRequestId
// Return a unique string (use crypto.randomUUID())
export function generateRequestId(): string {
  throw new Error("Not implemented");
}
