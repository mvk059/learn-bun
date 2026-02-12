/**
 * Chapter 7.5 - Wiring Storage to API
 *
 * Connect database repositories to HTTP endpoints.
 */
import { SQL } from "bun";

// TODO: Implement createApp({ port, databaseUrl })
// 1. Create SQL connection to databaseUrl
// 2. Set up routes:
//    GET    /api/projects        -> list with pagination (page, limit query params)
//    POST   /api/projects        -> create (body: { name, description?, ownerId })
//    GET    /api/projects/:id    -> get by id
//    PUT    /api/projects/:id    -> update
//    DELETE /api/projects/:id    -> delete
// 3. Response envelope: { success: true, data, meta? } or { success: false, error }
// 4. Return { server, stop() }
//
// Use direct Bun.sql queries or a repository class
export function createApp(options: { port: number; databaseUrl: string }): {
  server: ReturnType<typeof Bun.serve>;
  stop: () => void;
} {
  throw new Error("Not implemented");
}
