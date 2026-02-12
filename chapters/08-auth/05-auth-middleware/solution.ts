/**
 * Chapter 8.5 - Auth Middleware (Solution)
 */
import { SQL } from "bun";
import { SignJWT, jwtVerify } from "jose";

export function createProtectedServer(options: {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
}) {
  const sql = new SQL({ url: options.databaseUrl });
  const secretKey = new TextEncoder().encode(options.jwtSecret);

  async function createToken(payload: Record<string, any>): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);
  }

  async function verifyToken(token: string): Promise<Record<string, any> | null> {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      return payload as Record<string, any>;
    } catch {
      return null;
    }
  }

  async function getAuthUser(req: Request): Promise<{ userId: string; role: string } | null> {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.slice(7);
    const payload = await verifyToken(token);
    if (!payload) return null;
    return { userId: payload.userId as string, role: payload.role as string };
  }

  function validatePasswordStrength(pw: string): string[] {
    const errors: string[] = [];
    if (pw.length < 8) errors.push("Min 8 chars");
    if (!/[A-Z]/.test(pw)) errors.push("Need uppercase");
    if (!/[a-z]/.test(pw)) errors.push("Need lowercase");
    if (!/[0-9]/.test(pw)) errors.push("Need number");
    return errors;
  }

  const server = Bun.serve({
    port: options.port,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      try {
        // Register
        if (req.method === "POST" && pathname === "/api/auth/register") {
          const body = await req.json();
          const pwErrors = validatePasswordStrength(body.password || "");
          if (pwErrors.length > 0) return Response.json({ error: pwErrors.join(", ") }, { status: 400 });

          const dup1 = await sql`SELECT id FROM users WHERE username = ${body.username}`;
          if (dup1.length > 0) return Response.json({ error: "Username taken" }, { status: 409 });
          const dup2 = await sql`SELECT id FROM users WHERE email = ${body.email}`;
          if (dup2.length > 0) return Response.json({ error: "Email taken" }, { status: 409 });

          const hash = await Bun.password.hash(body.password, { algorithm: "argon2id" });
          const rows = await sql`INSERT INTO users (username, email, password_hash) VALUES (${body.username}, ${body.email}, ${hash}) RETURNING id, username, email, role, created_at`;
          return Response.json({ data: { id: rows[0].id, username: rows[0].username, email: rows[0].email, role: rows[0].role, createdAt: rows[0].created_at } }, { status: 201 });
        }

        // Login
        if (req.method === "POST" && pathname === "/api/auth/login") {
          const body = await req.json();
          const users = await sql`SELECT * FROM users WHERE username = ${body.username}`;
          if (users.length === 0) return Response.json({ error: "Invalid credentials" }, { status: 401 });
          const user = users[0];
          const valid = await Bun.password.verify(body.password, user.password_hash);
          if (!valid) return Response.json({ error: "Invalid credentials" }, { status: 401 });
          const token = await createToken({ userId: user.id, role: user.role });
          return Response.json({ data: { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } } });
        }

        // Public: list projects
        if (req.method === "GET" && pathname === "/api/projects") {
          const rows = await sql`SELECT * FROM projects ORDER BY created_at ASC`;
          return Response.json({ data: [...rows] });
        }

        // Protected: create project
        if (req.method === "POST" && pathname === "/api/projects") {
          const authUser = await getAuthUser(req);
          if (!authUser) return Response.json({ error: "Authentication required" }, { status: 401 });
          const body = await req.json();
          const rows = await sql`INSERT INTO projects (name, description, owner_id) VALUES (${body.name}, ${body.description ?? ""}, ${authUser.userId}) RETURNING *`;
          return Response.json({ data: rows[0] }, { status: 201 });
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
