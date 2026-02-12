/**
 * Chapter 8.7 - Role-Based Access Control (Solution)
 */
import { SQL } from "bun";
import { SignJWT, jwtVerify } from "jose";

function matchPath(pattern: string, pathname: string): { matched: boolean; params: Record<string, string> } {
  const pp = pattern.split("/"); const up = pathname.split("/");
  if (pp.length !== up.length) return { matched: false, params: {} };
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = up[i];
    else if (pp[i] !== up[i]) return { matched: false, params: {} };
  }
  return { matched: true, params };
}

export function createRbacServer(options: { port: number; databaseUrl: string; jwtSecret: string }) {
  const sql = new SQL({ url: options.databaseUrl });
  const secretKey = new TextEncoder().encode(options.jwtSecret);

  async function createToken(payload: Record<string, any>): Promise<string> {
    return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(secretKey);
  }

  async function getAuthUser(req: Request): Promise<{ userId: string; role: string } | null> {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    try {
      const { payload } = await jwtVerify(auth.slice(7), secretKey);
      return { userId: payload.userId as string, role: payload.role as string };
    } catch { return null; }
  }

  function validatePw(pw: string): string[] {
    const e: string[] = [];
    if (pw.length < 8) e.push("Min 8 chars");
    if (!/[A-Z]/.test(pw)) e.push("Need uppercase");
    if (!/[a-z]/.test(pw)) e.push("Need lowercase");
    if (!/[0-9]/.test(pw)) e.push("Need number");
    return e;
  }

  const server = Bun.serve({
    port: options.port,
    async fetch(req) {
      const url = new URL(req.url);
      const { pathname } = url;
      try {
        // Register
        if (req.method === "POST" && pathname === "/api/auth/register") {
          const body = await req.json();
          const pwErr = validatePw(body.password || "");
          if (pwErr.length) return Response.json({ error: pwErr.join(", ") }, { status: 400 });
          const d1 = await sql`SELECT id FROM users WHERE username = ${body.username}`;
          if (d1.length) return Response.json({ error: "Username taken" }, { status: 409 });
          const d2 = await sql`SELECT id FROM users WHERE email = ${body.email}`;
          if (d2.length) return Response.json({ error: "Email taken" }, { status: 409 });
          const hash = await Bun.password.hash(body.password, { algorithm: "argon2id" });
          const rows = await sql`INSERT INTO users (username, email, password_hash) VALUES (${body.username}, ${body.email}, ${hash}) RETURNING id, username, email, role, created_at`;
          return Response.json({ data: { id: rows[0].id, username: rows[0].username, email: rows[0].email, role: rows[0].role } }, { status: 201 });
        }

        // Login
        if (req.method === "POST" && pathname === "/api/auth/login") {
          const body = await req.json();
          const users = await sql`SELECT * FROM users WHERE username = ${body.username}`;
          if (!users.length) return Response.json({ error: "Invalid credentials" }, { status: 401 });
          const user = users[0];
          if (!(await Bun.password.verify(body.password, user.password_hash))) return Response.json({ error: "Invalid credentials" }, { status: 401 });
          const token = await createToken({ userId: user.id, role: user.role });
          return Response.json({ data: { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } } });
        }

        // List projects (public)
        if (req.method === "GET" && pathname === "/api/projects") {
          const rows = await sql`SELECT * FROM projects ORDER BY created_at ASC`;
          return Response.json({ data: [...rows] });
        }

        // Create project (auth required)
        if (req.method === "POST" && pathname === "/api/projects") {
          const authUser = await getAuthUser(req);
          if (!authUser) return Response.json({ error: "Authentication required" }, { status: 401 });
          const body = await req.json();
          const rows = await sql`INSERT INTO projects (name, description, owner_id) VALUES (${body.name}, ${body.description ?? ""}, ${authUser.userId}) RETURNING *`;
          return Response.json({ data: rows[0] }, { status: 201 });
        }

        // Single project routes
        const idMatch = matchPath("/api/projects/:id", pathname);
        if (idMatch.matched) {
          const { id } = idMatch.params;
          if (req.method === "GET") {
            const rows = await sql`SELECT * FROM projects WHERE id = ${id}`;
            if (!rows.length) return Response.json({ error: "Not Found" }, { status: 404 });
            return Response.json({ data: rows[0] });
          }
          if (req.method === "DELETE") {
            const authUser = await getAuthUser(req);
            if (!authUser) return Response.json({ error: "Authentication required" }, { status: 401 });
            const rows = await sql`SELECT * FROM projects WHERE id = ${id}`;
            if (!rows.length) return Response.json({ error: "Not Found" }, { status: 404 });
            const project = rows[0];
            if (authUser.role !== "admin" && project.owner_id !== authUser.userId) {
              return Response.json({ error: "Forbidden" }, { status: 403 });
            }
            await sql`DELETE FROM projects WHERE id = ${id}`;
            return new Response(null, { status: 204 });
          }
        }

        return Response.json({ error: "Not Found" }, { status: 404 });
      } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
      }
    },
  });

  return { server, stop: () => { server.stop(true); sql.close(); } };
}
