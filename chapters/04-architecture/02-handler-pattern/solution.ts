/**
 * Chapter 4.2 - Handler Pattern (Solution)
 */

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

export async function listProjectsHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "10", 10) || 10));
  const offset = (page - 1) * limit;
  const paginated = projects.slice(offset, offset + limit);
  return Response.json(paginated);
}

export async function getProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const project = projects.find((p) => p.id === params.id);
  if (!project) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  return Response.json(project);
}

export async function createProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const body = await req.json();
  if (!body.name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  const project: Project = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description ?? "",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  return Response.json(project, { status: 201 });
}

export async function deleteProjectHandler(
  req: Request,
  params: Record<string, string>,
  projects: Project[]
): Promise<Response> {
  const index = projects.findIndex((p) => p.id === params.id);
  if (index === -1) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
  projects.splice(index, 1);
  return new Response(null, { status: 204 });
}
