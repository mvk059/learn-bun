/**
 * Chapter 7.3 - Repository Pattern
 *
 * Data access abstraction layer over Bun.sql.
 */
import { SQL } from "bun";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FindAllOptions {
  page: number;
  limit: number;
  search?: string;
}

// TODO: Implement ProjectRepository class
// Constructor takes sql instance
// Methods:
// - create(input): Promise<any> - INSERT with RETURNING *
// - findById(id): Promise<any | null> - SELECT by id
// - findAll(options: FindAllOptions): Promise<PaginatedResult<any>>
//   - Use LIMIT/OFFSET for pagination
//   - Use ILIKE for search on name field when search is provided
//   - Return total count alongside data
// - update(id, input: Record<string, any>): Promise<any | null>
//   - Only update provided fields
// - delete(id): Promise<boolean>
export class ProjectRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async create(input: any): Promise<any> {
    throw new Error("Not implemented");
  }

  async findById(id: string): Promise<any | null> {
    throw new Error("Not implemented");
  }

  async findAll(options: FindAllOptions): Promise<PaginatedResult<any>> {
    throw new Error("Not implemented");
  }

  async update(id: string, input: Record<string, any>): Promise<any | null> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
}
