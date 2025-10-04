import type { Request, Response, NextFunction } from "express"
import crypto from "crypto"
import User, { type IUser } from "../models/user.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"
import { hashPassword, comparePassword } from "../utils/password.util"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.util"
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email.service"

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password, role } = req.body

  // Check if user exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return sendError(res, 400, "User already exists with this email")
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || "buyer",
    emailVerificationToken: hashedToken,
    emailVerificationExpire: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  })

  // Send verification email
  await sendVerificationEmail(email, verificationToken, `${firstName} ${lastName}`)

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  })

  const refreshToken = generateRefreshToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  })

  // Save refresh token
  user.refreshToken = refreshToken
  await user.save()

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  })

  sendSuccess(res, 201, "Registration successful. Please verify your email.", {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
  })
})

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  // Check if user exists
  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    return sendError(res, 401, "Invalid credentials")
  }

  // Check if account is suspended
  if (user.isSuspended) {
    return sendError(res, 403, `Account suspended. Reason: ${user.suspensionReason || "Violation of terms"}`)
  }

  // Check if account is active
  if (!user.isActive) {
    return sendError(res, 403, "Account is deactivated")
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    return sendError(res, 401, "Invalid credentials")
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  })

  const refreshToken = generateRefreshToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  })

  // Update user
  user.refreshToken = refreshToken
  user.lastLogin = new Date()
  await user.save()

  // Set refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })

  sendSuccess(res, 200, "Login successful", {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
    },
    accessToken,
  })
})

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies

  if (!refreshToken) {
    return sendError(res, 401, "Refresh token not found")
  }

  try {
    const decoded = verifyRefreshToken(refreshToken)

    const user = await User.findById(decoded.userId)
    if (!user || user.refreshToken !== refreshToken) {
      return sendError(res, 401, "Invalid refresh token")
    }

    const newAccessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    })

    sendSuccess(res, 200, "Token refreshed successfully", {
      accessToken: newAccessToken,
    })
  } catch (error) {
    return sendError(res, 401, "Invalid or expired refresh token")
  }
})

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const reqUser = (req as Request & { user?: IUser }).user
  const user = await User.findById(reqUser?._id)
  if (user) {
    user.refreshToken = undefined
    await user.save()
  }

  res.clearCookie("refreshToken")
  sendSuccess(res, 200, "Logout successful")
})

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  })

  if (!user) {
    return sendError(res, 400, "Invalid or expired verification token")
  }

  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpire = undefined
  await user.save()

  sendSuccess(res, 200, "Email verified successfully")
})

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const reqUser = (req as Request & { user?: IUser }).user

  const user = await User.findById(reqUser?._id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  if (user.isEmailVerified) {
    return sendError(res, 400, "Email already verified")
  }

  const verificationToken = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

  user.emailVerificationToken = hashedToken
  user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await user.save()

  await sendVerificationEmail(user.email, verificationToken, `${user.firstName} ${user.lastName}`)

  sendSuccess(res, 200, "Verification email sent")
})

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return sendError(res, 404, "No user found with this email")
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  user.passwordResetToken = hashedToken
  user.passwordResetExpire = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  await user.save()

  await sendPasswordResetEmail(user.email, resetToken, `${user.firstName} ${user.lastName}`)

  sendSuccess(res, 200, "Password reset email sent")
})

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params
  const { password } = req.body

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  })

  if (!user) {
    return sendError(res, 400, "Invalid or expired reset token")
  }

  user.password = await hashPassword(password)
  user.passwordResetToken = undefined
  user.passwordResetExpire = undefined
  await user.save()

  sendSuccess(res, 200, "Password reset successful")
})
