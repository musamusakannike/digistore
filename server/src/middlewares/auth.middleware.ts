import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import User from "../models/user.model"
import { verifyAccessToken } from "../utils/token.util"
import { sendError } from "../utils/response.util"
import { asyncHandler } from "../utils/asynchandler.util"

type AuthRequest = Request & { user?: IUser }

export const protect = asyncHandler<AuthRequest>(async (req, res, next) => {
  let token: string | undefined

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return sendError(res, 401, "Not authorized to access this route")
  }

  try {
    const decoded = verifyAccessToken(token)

    const user = await User.findById(decoded.userId)

    if (!user) {
      return sendError(res, 401, "User not found")
    }

    if (!user.isActive) {
      return sendError(res, 403, "Account is deactivated")
    }

    if (user.isSuspended) {
      return sendError(res, 403, "Account is suspended")
    }

    req.user = user
    next()
  } catch (error) {
    return sendError(res, 401, "Not authorized to access this route")
  }
})

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, `User role '${req.user?.role}' is not authorized to access this route`)
    }
    next()
  }
}

export const verifyEmail = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isEmailVerified) {
    return sendError(res, 403, "Please verify your email to access this resource")
  }
  next()
}
