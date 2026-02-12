/**
 * Chapter 3.2 - Method Routing (Solution)
 */

interface Project {
  id: string;
  name: string;
  description: string;
}

export function createServer(port: number) {
  const projects: Project[] = [];

  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === "/api/projects") {
        if (req.method === "GET") {
          return Response.json(projects);
        }

        if (req.method === "POST") {
          const body = await req.json();
          const project: Project = {
            id: crypto.randomUUID(),
            name: body.name,
            description: body.description,
          };
          projects.push(project);
          return Response.json(project, { status: 201 });
        }

        return Response.json(
          { error: "Method Not Allowed" },
          { status: 405 },
        );
      }

      return Response.json({ error: "Not Found" }, { status: 404 });
    },
  });
}
