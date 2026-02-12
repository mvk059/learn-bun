/**
 * Chapter 1.1 - Hello Bun
 *
 * Your first Bun program! Implement the functions below.
 */

// It should take a name parameter and return:
// "Hello, {name}! Welcome to the Task Manager API."
export function greet(name: string): string {
  return `Hello, ${name}! Welcome to the Task Manager API.`
}

// It should return the current Bun version using the Bun.version API
export function getBunVersion(): string {
  return Bun.version;
}
