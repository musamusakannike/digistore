import type { Request } from "express"

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginationResult {
  page: number
  limit: number
  skip: number
  sortBy: string
  sortOrder: "asc" | "desc"
}

export const getPaginationParams = (req: Request): PaginationResult => {
  const page = Math.max(1, Number.parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit as string) || 20))
  const skip = (page - 1) * limit
  const sortBy = (req.query.sortBy as string) || "createdAt"
  const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc"

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  }
}

export const getPaginationMeta = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  }
}
