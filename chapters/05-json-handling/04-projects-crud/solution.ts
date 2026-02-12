/**
 * Chapter 5.4 - Projects CRUD Endpoints (Solution)
 */

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: string;
  createdAt: string;
}

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

export function createProjectsServer(port: number) {
  const projects = new Map<string, Project>();

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;
      const method = req.method;

      // GET /api/projects - list
      if (method === "GET" && pathname === "/api/projects") {
        const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1") || 1);
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10") || 10));
        const all = Array.from(projects.values());
        const total = all.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const data = all.slice((page - 1) * limit, page * limit);
        return Response.json({ success: true, data, meta: { total, page, limit, totalPages } });
      }

      // POST /api/projects - create
      if (method === "POST" && pathname === "/api/projects") {
        const body = await req.json();
        const errors: string[] = [];
        if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
          errors.push("Name is required");
        }
        if (!body.ownerId || typeof body.ownerId !== "string") {
          errors.push("Owner ID is required");
        }
        if (errors.length > 0) {
          return Response.json({ success: false, error: errors.join(", ") }, { status: 400 });
        }
        const project: Project = {
          id: crypto.randomUUID(),
          name: body.name,
          description: body.description ?? "",
          ownerId: body.ownerId,
          status: body.status ?? "active",
          createdAt: new Date().toISOString(),
        };
        projects.set(project.id, project);
        return Response.json({ success: true, data: project }, { status: 201 });
      }

      // GET /api/projects/:id
      const getMatch = matchPath("/api/projects/:id", pathname);
      if (method === "GET" && getMatch.matched) {
        const project = projects.get(getMatch.params.id);
        if (!project) return Response.json({ success: false, error: "Not Found" }, { status: 404 });
        return Response.json({ success: true, data: project });
      }

      // PUT /api/projects/:id
      const putMatch = matchPath("/api/projects/:id", pathname);
      if (method === "PUT" && putMatch.matched) {
        const project = projects.get(putMatch.params.id);
        if (!project) return Response.json({ success: false, error: "Not Found" }, { status: 404 });
        const body = await req.json();
        const updated = { ...project, ...body, id: project.id, createdAt: project.createdAt };
        projects.set(project.id, updated);
        return Response.json({ success: true, data: updated });
      }

      // DELETE /api/projects/:id
      const delMatch = matchPath("/api/projects/:id", pathname);
      if (method === "DELETE" && delMatch.matched) {
        if (!projects.has(delMatch.params.id)) {
          return Response.json({ success: false, error: "Not Found" }, { status: 404 });
        }
        projects.delete(delMatch.params.id);
        return new Response(null, { status: 204 });
      }

      return Response.json({ success: false, error: "Not Found" }, { status: 404 });
    },
  });

  return { server, stop: () => server.stop(true) };
}
