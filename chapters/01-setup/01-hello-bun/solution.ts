/**
 * Chapter 1.1 - Hello Bun (Solution)
 */

export function greet(name: string): string {
  return `Hello, ${name}! Welcome to the Task Manager API.`;
}

export function getBunVersion(): string {
  return Bun.version;
}
