/**
 * Chapter 2.1 - Hello Server (Solution)
 */

export function createServer(port: number) {
  return Bun.serve({
    port,
    fetch(req) {
      return new Response("Hello from Task Manager API!");
    },
  });
}
