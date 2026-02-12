/**
 * Chapter 8.4 - Login Endpoint (Solution)
 */
import { SQL } from "bun";
import { SignJWT, jwtVerify } from "jose";

class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function validatePasswordStrength(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(pw)) errors.push("Must contain uppercase");
  if (!/[a-z]/.test(pw)) errors.push("Must contain lowercase");
  if (!/[0-9]/.test(pw)) errors.push("Must contain number");
  return errors;
}

export function createAuthServer(options: {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
}) {
  const sql = new SQL({ url: options.databaseUrl });
  const secretKey = new TextEncoder().encode(options.jwtSecret);

  async function createToken(payload: { userId: string; role: string }): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);
  }

  const server = Bun.serve({
    port: options.port,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      try {
        if (req.method === "POST" && pathname === "/api/auth/register") {
          const body = await req.json();
          const pwErrors = validatePasswordStrength(body.password || "");
          if (pwErrors.length > 0) {
            return Response.json({ error: pwErrors.join(", ") }, { status: 400 });
          }

          const existingUser = await sql`SELECT id FROM users WHERE username = ${body.username}`;
          if (existingUser.length > 0) {
            return Response.json({ error: "Username already taken" }, { status: 409 });
          }

          const existingEmail = await sql`SELECT id FROM users WHERE email = ${body.email}`;
          if (existingEmail.length > 0) {
            return Response.json({ error: "Email already registered" }, { status: 409 });
          }

          const hash = await Bun.password.hash(body.password, { algorithm: "argon2id" });
          const rows = await sql`
            INSERT INTO users (username, email, password_hash)
            VALUES (${body.username}, ${body.email}, ${hash})
            RETURNING id, username, email, role, created_at
          `;

          return Response.json({
            data: {
              id: rows[0].id,
              username: rows[0].username,
              email: rows[0].email,
              role: rows[0].role,
              createdAt: rows[0].created_at,
            },
          }, { status: 201 });
        }

        if (req.method === "POST" && pathname === "/api/auth/login") {
          const body = await req.json();
          const invalidMsg = "Invalid credentials";

          const users = await sql`SELECT * FROM users WHERE username = ${body.username}`;
          if (users.length === 0) {
            return Response.json({ error: invalidMsg }, { status: 401 });
          }

          const user = users[0];
          const valid = await Bun.password.verify(body.password, user.password_hash);
          if (!valid) {
            return Response.json({ error: invalidMsg }, { status: 401 });
          }

          const token = await createToken({ userId: user.id, role: user.role });

          return Response.json({
            data: {
              token,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
              },
            },
          });
        }

        return Response.json({ error: "Not Found" }, { status: 404 });
      } catch (error: any) {
        if (error.statusCode) {
          return Response.json({ error: error.message }, { status: error.statusCode });
        }
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
      }
    },
  });

  return {
    server,
    stop: () => { server.stop(true); sql.close(); },
  };
}
