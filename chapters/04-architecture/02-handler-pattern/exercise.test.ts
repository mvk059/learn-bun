import { describe, test, expect, beforeEach } from "bun:test";

const MODULE = process.env.TEST_SOLUTION === "1" ? "./solution" : "./exercise";
const { listProjectsHandler, getProjectHandler, createProjectHandler, deleteProjectHandler } = await import(MODULE);

// In-memory store for testing
interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

let projects: Project[];

function makeReq(method: string, url: string, body?: any): Request {
  const opts: RequestInit = { method };
  if (body) {
    opts.body = JSON.stringify(body);
    opts.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, opts);
}

beforeEach(() => {
  projects = [
    { id: "p1", name: "Project Alpha", description: "First project", status: "active", createdAt: "2024-01-01T00:00:00.000Z" },
    { id: "p2", name: "Project Beta", description: "Second project", status: "active", createdAt: "2024-01-02T00:00:00.000Z" },
    { id: "p3", name: "Project Gamma", description: "Third project", status: "archived", createdAt: "2024-01-03T00:00:00.000Z" },
  ];
});

describe("Handler Pattern", () => {
  describe("listProjectsHandler", () => {
    test("returns all projects", async () => {
      const req = makeReq("GET", "http://localhost/api/projects");
      const res = await listProjectsHandler(req, {}, projects);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(3);
    });

    test("supports pagination via query params", async () => {
      const req = makeReq("GET", "http://localhost/api/projects?page=1&limit=2");
      const res = await listProjectsHandler(req, {}, projects);
      const data = await res.json();
      expect(data.length).toBe(2);
    });
  });

  describe("getProjectHandler", () => {
    test("returns project by id", async () => {
      const req = makeReq("GET", "http://localhost/api/projects/p1");
      const res = await getProjectHandler(req, { id: "p1" }, projects);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe("Project Alpha");
    });

    test("returns 404 for missing project", async () => {
      const req = makeReq("GET", "http://localhost/api/projects/missing");
      const res = await getProjectHandler(req, { id: "missing" }, projects);
      expect(res.status).toBe(404);
    });
  });

  describe("createProjectHandler", () => {
    test("creates project with valid input", async () => {
      const req = makeReq("POST", "http://localhost/api/projects", {
        name: "New Project",
        description: "A new one",
      });
      const res = await createProjectHandler(req, {}, projects);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.name).toBe("New Project");
      expect(data.id).toBeDefined();
    });

    test("returns 400 for missing name", async () => {
      const req = makeReq("POST", "http://localhost/api/projects", {
        description: "No name",
      });
      const res = await createProjectHandler(req, {}, projects);
      expect(res.status).toBe(400);
    });
  });

  describe("deleteProjectHandler", () => {
    test("deletes existing project", async () => {
      const req = makeReq("DELETE", "http://localhost/api/projects/p1");
      const res = await deleteProjectHandler(req, { id: "p1" }, projects);
      expect(res.status).toBe(204);
    });

    test("returns 404 for missing project", async () => {
      const req = makeReq("DELETE", "http://localhost/api/projects/missing");
      const res = await deleteProjectHandler(req, { id: "missing" }, projects);
      expect(res.status).toBe(404);
    });
  });
});
