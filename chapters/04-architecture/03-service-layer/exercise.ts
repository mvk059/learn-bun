/**
 * Chapter 4.3 - Service Layer
 *
 * Business logic separation with an in-memory store.
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

// TODO: Implement ProjectService class with in-memory Map storage
// Methods:
// - create(input: CreateProjectInput): Project - generate id + createdAt
// - findById(id: string): Project | null
// - findAll(options?: { page?: number; limit?: number }): PaginatedResult<Project>
// - update(id: string, input: Partial<CreateProjectInput>): Project | null
// - delete(id: string): boolean
// - search(query: string): Project[] - case-insensitive name search
export class ProjectService {
  // Add your implementation here

  create(input: CreateProjectInput): Project {
    throw new Error("Not implemented");
  }

  findById(id: string): Project | null {
    throw new Error("Not implemented");
  }

  findAll(options?: { page?: number; limit?: number }): PaginatedResult<Project> {
    throw new Error("Not implemented");
  }

  update(id: string, input: Partial<CreateProjectInput>): Project | null {
    throw new Error("Not implemented");
  }

  delete(id: string): boolean {
    throw new Error("Not implemented");
  }

  search(query: string): Project[] {
    throw new Error("Not implemented");
  }
}
