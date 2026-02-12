/**
 * Chapter 7.3 - Repository Pattern (Solution)
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

export class ProjectRepository {
  constructor(private sql: InstanceType<typeof SQL>) {}

  async create(input: any): Promise<any> {
    const rows = await this.sql`
      INSERT INTO projects (name, description, owner_id, status)
      VALUES (${input.name}, ${input.description ?? ""}, ${input.owner_id}, ${input.status ?? "active"})
      RETURNING *
    `;
    return rows[0];
  }

  async findById(id: string): Promise<any | null> {
    const rows = await this.sql`SELECT * FROM projects WHERE id = ${id}`;
    return rows[0] ?? null;
  }

  async findAll(options: FindAllOptions): Promise<PaginatedResult<any>> {
    const { page, limit, search } = options;
    const offset = (page - 1) * limit;

    let data: any[];
    let countResult: any[];

    if (search) {
      const pattern = `%${search}%`;
      data = await this.sql`
        SELECT * FROM projects
        WHERE name ILIKE ${pattern}
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await this.sql`
        SELECT COUNT(*)::int as count FROM projects WHERE name ILIKE ${pattern}
      `;
    } else {
      data = await this.sql`
        SELECT * FROM projects
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await this.sql`SELECT COUNT(*)::int as count FROM projects`;
    }

    const total = countResult[0].count;
    return {
      data: [...data],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async update(id: string, input: Record<string, any>): Promise<any | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...input };
    const rows = await this.sql`
      UPDATE projects
      SET name = ${updated.name}, description = ${updated.description},
          owner_id = ${updated.owner_id}, status = ${updated.status}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.sql`DELETE FROM projects WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }
}
