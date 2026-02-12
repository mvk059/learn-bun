/**
 * Chapter 4.3 - Service Layer (Solution)
 */

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: "active" | "archived";
  createdAt: Date;
}

type CreateProjectInput = Omit<Project, "id" | "createdAt">;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProjectService {
  private projects = new Map<string, Project>();

  create(input: CreateProjectInput): Project {
    const project: Project = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  findById(id: string): Project | null {
    return this.projects.get(id) ?? null;
  }

  findAll(options?: { page?: number; limit?: number }): PaginatedResult<Project> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const all = Array.from(this.projects.values());
    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const data = all.slice(offset, offset + limit);

    return { data, total, page, limit, totalPages };
  }

  update(id: string, input: Partial<CreateProjectInput>): Project | null {
    const project = this.projects.get(id);
    if (!project) return null;
    const updated = { ...project, ...input };
    this.projects.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.projects.delete(id);
  }

  search(query: string): Project[] {
    const lower = query.toLowerCase();
    return Array.from(this.projects.values()).filter((p) =>
      p.name.toLowerCase().includes(lower)
    );
  }
}
