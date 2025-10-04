import type { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { sendError } from "../utils/response.util"

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(", ")
    return sendError(res, 400, errorMessages)
  }

  next()
}
