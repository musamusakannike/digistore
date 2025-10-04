import type { Response } from "express"

interface ApiResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const sendSuccess = (
  res: Response,
  statusCode = 200,
  message: string,
  data?: any,
  pagination?: any,
): Response => {
  const response: ApiResponse = {
    success: true,
    message,
    ...(data && { data }),
    ...(pagination && { pagination }),
  }

  return res.status(statusCode).json(response)
}

export const sendError = (res: Response, statusCode = 500, error: string): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  }

  return res.status(statusCode).json(response)
}
