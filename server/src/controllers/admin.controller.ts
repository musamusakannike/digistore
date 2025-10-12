import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import User from "../models/user.model"
import Product from "../models/product.model"
import Order from "../models/order.model"
import Transaction from "../models/transaction.model"
import Review from "../models/review.model"
import Category from "../models/category.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"
import { generateSlug } from "../utils/slug.util"
import cloudinary from "../config/cloudinary.config"

type AuthRequest = Request & { user?: IUser; files?: any }

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  const { role, isActive, search } = req.query

  const query: any = {}
  if (role) query.role = role
  if (isActive !== undefined) query.isActive = isActive === "true"
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ]
  }

  const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

  const total = await User.countDocuments(query)

  sendSuccess(
    res,
    200,
    "Users retrieved successfully",
    { users },
    {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  )
})

// @desc    Get user details
// @route   GET /api/v1/admin/users/:id
// @access  Private (Admin)
export const getUserDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).select("-password")

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  // Get user stats
  const orderCount = await Order.countDocuments({ buyer: user._id })
  const reviewCount = await Review.countDocuments({ user: user._id })

  let productCount = 0
  let totalSales = 0

  if (user.role === "seller") {
    productCount = await Product.countDocuments({ seller: user._id })
    totalSales = user.totalSales
  }

  sendSuccess(res, 200, "User details retrieved", {
    user,
    stats: {
      orderCount,
      reviewCount,
      productCount,
      totalSales,
    },
  })
})

// @desc    Update user status
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { isActive, isSuspended, suspensionReason } = req.body

  const user = await User.findById(req.params.id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  if (isActive !== undefined) user.isActive = isActive
  if (isSuspended !== undefined) {
    user.isSuspended = isSuspended
    if (isSuspended && suspensionReason) {
      user.suspensionReason = suspensionReason
    } else if (!isSuspended) {
      user.suspensionReason = undefined
    }
  }

  await user.save()

  sendSuccess(res, 200, "User status updated", { user })
})

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return sendError(res, 404, "User not found")
  }

  if (user.role === "admin") {
    return sendError(res, 403, "Cannot delete admin users")
  }

  await user.deleteOne()

  sendSuccess(res, 200, "User deleted successfully")
})

// @desc    Get single product (admin)
// @route   GET /api/v1/admin/products/:id
// @access  Private (Admin)
export const getProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("seller", "firstName lastName businessName avatar bio totalSales")

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  sendSuccess(res, 200, "Product retrieved successfully", { product })
})

// @desc    Get all products (admin)
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
export const getAllProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  const { status, search } = req.query

  const query: any = {}
  if (status) query.status = status
  if (search) {
    query.$text = { $search: search as string }
  }

  const products = await Product.find(query)
    .populate("category", "name")
    .populate("seller", "firstName lastName businessName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Product.countDocuments(query)

  sendSuccess(
    res,
    200,
    "Products retrieved successfully",
    { products },
    {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  )
})

// @desc    Approve product
// @route   PUT /api/v1/admin/products/:id/approve
// @access  Private (Admin)
export const approveProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  product.status = "approved"
  product.rejectionReason = undefined
  await product.save()

  // Update category product count
  await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } })

  sendSuccess(res, 200, "Product approved successfully", { product })
})

// @desc    Reject product
// @route   PUT /api/v1/admin/products/:id/reject
// @access  Private (Admin)
export const rejectProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { reason } = req.body

  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  product.status = "rejected"
  product.rejectionReason = reason
  await product.save()

  sendSuccess(res, 200, "Product rejected", { product })
})

// @desc    Suspend product
// @route   PUT /api/v1/admin/products/:id/suspend
// @access  Private (Admin)
export const suspendProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  product.status = "suspended"
  product.isActive = false
  await product.save()

  sendSuccess(res, 200, "Product suspended", { product })
})

// @desc    Toggle featured product
// @route   PUT /api/v1/admin/products/:id/featured
// @access  Private (Admin)
export const toggleFeaturedProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  product.isFeatured = !product.isFeatured
  await product.save()

  sendSuccess(res, 200, `Product ${product.isFeatured ? "featured" : "unfeatured"}`, { product })
})

// @desc    Update product (admin)
// @route   PUT /api/v1/admin/products/:id
// @access  Private (Admin)
export const updateProduct = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  const {
    title,
    description,
    shortDescription,
    category,
    price,
    discountPrice,
    tags,
    metaTitle,
    metaDescription,
    isActive,
    seller,
  } = req.body

  // Update fields
  if (title && title !== product.title) {
    product.title = title
    product.slug = await generateSlug(title, Product)
  }
  if (description) product.description = description
  if (shortDescription) product.shortDescription = shortDescription
  if (category) {
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return sendError(res, 404, "Category not found")
    }
    product.category = category
  }
  if (price !== undefined) product.price = price
  if (discountPrice !== undefined) product.discountPrice = discountPrice
  if (tags) product.tags = JSON.parse(tags)
  if (metaTitle) product.metaTitle = metaTitle
  if (metaDescription) product.metaDescription = metaDescription
  if (isActive !== undefined) product.isActive = isActive
  if (seller) {
    const sellerExists = await User.findById(seller)
    if (!sellerExists || sellerExists.role !== "seller") {
      return sendError(res, 404, "Seller not found")
    }
    product.seller = seller
  }

  // Handle thumbnail upload
  if (req.files && req.files.thumbnail) {
    const file = req.files.thumbnail as any
    // Delete old thumbnail if exists
    if (product.thumbnail) {
      const publicId = product.thumbnail.split("/").slice(-2).join("/").split(".")[0]
      await cloudinary.uploader.destroy(publicId)
    }
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "digistore/products",
      width: 800,
      crop: "fill",
    })
    product.thumbnail = result.secure_url
  }

  await product.save()

  sendSuccess(res, 200, "Product updated successfully", { product })
})

// @desc    Delete product (admin)
// @route   DELETE /api/v1/admin/products/:id
// @access  Private (Admin)
export const deleteProduct = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Delete files from cloudinary
  if (product.files && product.files.length > 0) {
    for (const file of product.files) {
      await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" })
    }
  }

  // Delete images from cloudinary
  if (product.thumbnail) {
    const publicId = product.thumbnail.split("/").slice(-2).join("/").split(".")[0]
    await cloudinary.uploader.destroy(publicId)
  }

  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      const publicId = image.split("/").slice(-2).join("/").split(".")[0]
      await cloudinary.uploader.destroy(publicId)
    }
  }

  await product.deleteOne()

  // Update category product count
  if (product.status === "approved") {
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } })
  }

  sendSuccess(res, 200, "Product deleted successfully")
})

// @desc    Get all orders (admin)
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
export const getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 20
  const skip = (page - 1) * limit

  const { status, paymentStatus } = req.query

  const query: any = {}
  if (status) query.status = status
  if (paymentStatus) query.paymentStatus = paymentStatus

  const orders = await Order.find(query)
    .populate("buyer", "firstName lastName email")
    .populate("items.product", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Order.countDocuments(query)

  sendSuccess(
    res,
    200,
    "Orders retrieved successfully",
    { orders },
    {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  )
})

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const totalUsers = await User.countDocuments()
  const totalSellers = await User.countDocuments({ role: "seller" })
  const totalBuyers = await User.countDocuments({ role: "buyer" })

  const totalProducts = await Product.countDocuments()
  const approvedProducts = await Product.countDocuments({ status: "approved" })
  const pendingProducts = await Product.countDocuments({ status: "pending" })

  const totalOrders = await Order.countDocuments()
  const completedOrders = await Order.countDocuments({ status: "completed" })
  const pendingOrders = await Order.countDocuments({ status: "pending" })

  const revenueStats = await Transaction.aggregate([
    { $match: { status: "successful" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ])

  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0
  const platformFee = totalRevenue * 0.1 // 10% platform fee

  sendSuccess(res, 200, "Dashboard stats retrieved", {
    users: {
      total: totalUsers,
      sellers: totalSellers,
      buyers: totalBuyers,
    },
    products: {
      total: totalProducts,
      approved: approvedProducts,
      pending: pendingProducts,
    },
    orders: {
      total: totalOrders,
      completed: completedOrders,
      pending: pendingOrders,
    },
    revenue: {
      total: totalRevenue,
      platformFee,
    },
  })
})
