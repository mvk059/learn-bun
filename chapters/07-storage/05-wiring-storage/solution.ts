/**
 * Chapter 7.5 - Wiring Storage to API (Solution)
 */
import { SQL } from "bun";

function matchPath(pattern: string, pathname: string): { matched: boolean; params: Record<string, string> } {
  const pp = pattern.split("/");
  const up = pathname.split("/");
  if (pp.length !== up.length) return { matched: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = up[i];
    else if (pp[i] !== up[i]) return { matched: false, params: {} };
  }
  return { matched: true, params };
}

export function createApp(options: { port: number; databaseUrl: string }) {
  const sql = new SQL({ url: options.databaseUrl });

  const server = Bun.serve({
    port: options.port,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const method = req.method;

      try {
        // List projects
        if (method === "GET" && pathname === "/api/projects") {
          const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);
          const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10") || 10));
          const offset = (page - 1) * limit;
          const search = url.searchParams.get("search");

          let data: any[];
          let countResult: any[];

          if (search) {
            const pattern = `%${search}%`;
            data = await sql`SELECT * FROM projects WHERE name ILIKE ${pattern} ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}`;
            countResult = await sql`SELECT COUNT(*)::int as count FROM projects WHERE name ILIKE ${pattern}`;
          } else {
            data = await sql`SELECT * FROM projects ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}`;
            countResult = await sql`SELECT COUNT(*)::int as count FROM projects`;
          }

          const total = countResult[0].count;
          return Response.json({
            success: true,
            data: [...data],
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
          });
        }

        // Create project
        if (method === "POST" && pathname === "/api/projects") {
          const body = await req.json();
          if (!body.name) {
            return Response.json({ success: false, error: "Name is required" }, { status: 400 });
          }
          const rows = await sql`
            INSERT INTO projects (name, description, owner_id, status)
            VALUES (${body.name}, ${body.description ?? ""}, ${body.ownerId ?? "unknown"}, ${body.status ?? "active"})
            RETURNING *
          `;
          return Response.json({ success: true, data: rows[0] }, { status: 201 });
        }

        // Single project routes
        const idMatch = matchPath("/api/projects/:id", pathname);
        if (idMatch.matched) {
          const { id } = idMatch.params;

          if (method === "GET") {
            const rows = await sql`SELECT * FROM projects WHERE id = ${id}`;
            if (rows.length === 0) return Response.json({ success: false, error: "Not Found" }, { status: 404 });
            return Response.json({ success: true, data: rows[0] });
          }

          if (method === "PUT") {
            const body = await req.json();
            const existing = await sql`SELECT * FROM projects WHERE id = ${id}`;
            if (existing.length === 0) return Response.json({ success: false, error: "Not Found" }, { status: 404 });
            const e = existing[0];
            const rows = await sql`
              UPDATE projects SET name = ${body.name ?? e.name}, description = ${body.description ?? e.description},
              owner_id = ${body.ownerId ?? e.owner_id}, status = ${body.status ?? e.status}
              WHERE id = ${id} RETURNING *
            `;
            return Response.json({ success: true, data: rows[0] });
          }

          if (method === "DELETE") {
            const rows = await sql`DELETE FROM projects WHERE id = ${id} RETURNING id`;
            if (rows.length === 0) return Response.json({ success: false, error: "Not Found" }, { status: 404 });
            return new Response(null, { status: 204 });
          }
        }

        return Response.json({ success: false, error: "Not Found" }, { status: 404 });
      } catch (error) {
        console.error(error);
        return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
      }
    },
  });

  return {
    server,
    stop: () => {
      server.stop(true);
      sql.close();
    },
  };
}
