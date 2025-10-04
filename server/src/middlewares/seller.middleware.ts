import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import { sendError } from "../utils/response.util"
import { asyncHandler } from "../utils/asynchandler.util"

type AuthRequest = Request & { user?: IUser }

// Middleware to check if user is a verified seller
export const isVerifiedSeller = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user

  if (!user) {
    return sendError(res, 401, "Authentication required")
  }

  if (user.role !== "seller" && user.role !== "admin") {
    return sendError(res, 403, "Only sellers can perform this action")
  }

  next()
})

// Middleware to check if seller account is active
export const isSellerActive = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user

  if (!user) {
    return sendError(res, 401, "Authentication required")
  }

  if (user.isSuspended) {
    return sendError(res, 403, `Your account has been suspended. Reason: ${user.suspensionReason || "Policy violation"}`)
  }

  if (!user.isActive) {
    return sendError(res, 403, "Your account is inactive. Please contact support.")
  }

  next()
})
