import type { Request, Response, NextFunction } from "express"

interface ErrorResponse extends Error {
  statusCode?: number
  code?: number
  keyValue?: any
  errors?: any
}

export const errorHandler = (err: ErrorResponse, req: Request, res: Response, next: NextFunction): void => {
  const error = { ...err }
  error.message = err.message

  // Log error for dev
  if (process.env.NODE_ENV === "development") {
    console.error(err)
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found"
    error.statusCode = 404
    error.message = message
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    error.statusCode = 400
    error.message = message
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors || {})
      .map((val: any) => val.message)
      .join(", ")
    error.statusCode = 400
    error.message = message
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.statusCode = 401
    error.message = "Invalid token"
  }

  if (err.name === "TokenExpiredError") {
    error.statusCode = 401
    error.message = "Token expired"
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
