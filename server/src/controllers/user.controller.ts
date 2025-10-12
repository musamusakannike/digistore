import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import User from "../models/user.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"
import { hashPassword, comparePassword } from "../utils/password.util"
import cloudinary from "../config/cloudinary.config"

type AuthRequest = Request & { user?: IUser; files?: any }

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getProfile = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id).populate("wishlist")

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  sendSuccess(res, 200, "Profile retrieved successfully", { user })
})

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { firstName, lastName, phone, bio, businessName, businessDescription } = req.body

  const user = await User.findById(req.user?._id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  // Update fields
  if (firstName) user.firstName = firstName
  if (lastName) user.lastName = lastName
  if (phone) user.phone = phone
  if (bio) user.bio = bio

  // Seller specific fields
  if (user.role === "seller") {
    if (businessName) user.businessName = businessName
    if (businessDescription) user.businessDescription = businessDescription
  }

  await user.save()

  sendSuccess(res, 200, "Profile updated successfully", { user })
})

// @desc    Upload avatar
// @route   POST /api/v1/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.files || !req.files.avatar) {
    return sendError(res, 400, "Please upload an image")
  }

  const file = req.files.avatar as any

  // Upload to cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "digistore/avatars",
    width: 300,
    height: 300,
    crop: "fill",
  })

  const user = await User.findById(req.user?._id)
  if (!user) {
    return sendError(res, 404, "User not found")
  }

  // Delete old avatar if exists
  if (user.avatar) {
    const publicId = user.avatar.split("/").slice(-2).join("/").split(".")[0]
    await cloudinary.uploader.destroy(publicId)
  }

  user.avatar = result.secure_url
  await user.save()

  sendSuccess(res, 200, "Avatar uploaded successfully", { avatar: user.avatar })
})

// @desc    Change password
// @route   PUT /api/v1/users/password
// @access  Private
export const changePassword = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id).select("+password")

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password)
  if (!isPasswordValid) {
    return sendError(res, 401, "Current password is incorrect")
  }

  // Update password
  user.password = await hashPassword(newPassword)
  await user.save()

  sendSuccess(res, 200, "Password changed successfully")
})

// @desc    Become a seller
// @route   POST /api/v1/users/become-seller
// @access  Private
export const becomeSeller = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { businessName, businessDescription, bankDetails } = req.body

  const user = await User.findById(req.user?._id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  if (user.role === "seller") {
    return sendError(res, 400, "You are already a seller")
  }

  if (!user.isEmailVerified) {
    return sendError(res, 400, "Please verify your email before becoming a seller")
  }

  user.role = "seller"
  user.businessName = businessName
  user.businessDescription = businessDescription
  user.bankDetails = bankDetails

  await user.save()

  sendSuccess(res, 200, "Successfully upgraded to seller account", { user })
})

// @desc    Update bank details
// @route   PUT /api/v1/users/bank-details
// @access  Private (Seller)
export const updateBankDetails = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { bankName, accountNumber, accountName } = req.body

  const user = await User.findById(req.user?._id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  if (user.role !== "seller") {
    return sendError(res, 403, "Only sellers can update bank details")
  }

  user.bankDetails = {
    bankName,
    accountNumber,
    accountName,
  }

  await user.save()

  sendSuccess(res, 200, "Bank details updated successfully", { bankDetails: user.bankDetails })
})

// @desc    Add to wishlist
// @route   POST /api/v1/users/wishlist/:productId
// @access  Private
export const addToWishlist = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params

  const user = await User.findById(req.user?._id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  if (user.wishlist.includes(productId as any)) {
    return sendError(res, 400, "Product already in wishlist")
  }

  user.wishlist.push(productId as any)
  await user.save()

  sendSuccess(res, 200, "Product added to wishlist")
})

// @desc    Remove from wishlist
// @route   DELETE /api/v1/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params

  const user = await User.findById(req.user?._id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId)
  await user.save()

  sendSuccess(res, 200, "Product removed from wishlist")
})

// @desc    Get wishlist
// @route   GET /api/v1/users/wishlist
// @access  Private
export const getWishlist = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id).populate("wishlist")

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  sendSuccess(res, 200, "Wishlist retrieved successfully", { wishlist: user.wishlist })
})

// @desc    Update push token
// @route   POST /api/v1/users/push-token
// @access  Private
export const updatePushToken = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { token } = req.body

  const user = await User.findById(req.user?._id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  user.expoPushToken = token
  await user.save()

  sendSuccess(res, 200, "Push token updated successfully")
})

// @desc    Get all sellers
// @route   GET /api/v1/users/sellers
// @access  Public
export const getAllSellers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const sellers = await User.find({ role: "seller" }).select("firstName lastName businessName")
  sendSuccess(res, 200, "Sellers retrieved successfully", { users: sellers })
})
