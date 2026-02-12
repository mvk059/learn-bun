/**
 * Chapter 8.6 - Account Management (Solution)
 */
import { SQL } from "bun";
import { SignJWT, jwtVerify } from "jose";

export function createAccountServer(options: { port: number; databaseUrl: string; jwtSecret: string }) {
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
          return Response.json({ data: { id: rows[0].id, username: rows[0].username, email: rows[0].email, role: rows[0].role, createdAt: rows[0].created_at } }, { status: 201 });
        }

        if (req.method === "POST" && pathname === "/api/auth/login") {
          const body = await req.json();
          const users = await sql`SELECT * FROM users WHERE username = ${body.username}`;
          if (!users.length) return Response.json({ error: "Invalid credentials" }, { status: 401 });
          const user = users[0];
          if (!(await Bun.password.verify(body.password, user.password_hash))) return Response.json({ error: "Invalid credentials" }, { status: 401 });
          const token = await createToken({ userId: user.id, role: user.role });
          return Response.json({ data: { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } } });
        }

        if (req.method === "PUT" && pathname === "/api/auth/profile") {
          const authUser = await getAuthUser(req);
          if (!authUser) return Response.json({ error: "Authentication required" }, { status: 401 });
          const body = await req.json();
          const users = await sql`SELECT * FROM users WHERE id = ${authUser.userId}`;
          if (!users.length) return Response.json({ error: "User not found" }, { status: 404 });
          const user = users[0];

          if (body.newPassword) {
            if (!body.currentPassword) return Response.json({ error: "Current password required" }, { status: 400 });
            if (!(await Bun.password.verify(body.currentPassword, user.password_hash))) return Response.json({ error: "Current password is incorrect" }, { status: 400 });
            const newHash = await Bun.password.hash(body.newPassword, { algorithm: "argon2id" });
            await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${authUser.userId}`;
          }

          if (body.email) {
            const dup = await sql`SELECT id FROM users WHERE email = ${body.email} AND id != ${authUser.userId}`;
            if (dup.length) return Response.json({ error: "Email taken" }, { status: 409 });
            await sql`UPDATE users SET email = ${body.email} WHERE id = ${authUser.userId}`;
          }

          const updated = await sql`SELECT id, username, email, role, created_at FROM users WHERE id = ${authUser.userId}`;
          return Response.json({ data: { id: updated[0].id, username: updated[0].username, email: updated[0].email, role: updated[0].role, createdAt: updated[0].created_at } });
        }

        if (req.method === "DELETE" && pathname === "/api/auth/account") {
          const authUser = await getAuthUser(req);
          if (!authUser) return Response.json({ error: "Authentication required" }, { status: 401 });
          await sql`DELETE FROM users WHERE id = ${authUser.userId}`;
          return new Response(null, { status: 204 });
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
