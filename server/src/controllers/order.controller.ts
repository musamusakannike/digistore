import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import Order from "../models/order.model"
import Cart from "../models/cart.model"
import Product from "../models/product.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"

type AuthRequest = Request & { user?: IUser }

// @desc    Create order from cart
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { notes } = req.body

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user?._id }).populate("items.product")

  if (!cart || cart.items.length === 0) {
    return sendError(res, 400, "Cart is empty")
  }

  // Validate all products are available and active
  const orderItems = []
  let subtotal = 0

  for (const item of cart.items) {
    const product = item.product as any

    if (!product) {
      return sendError(res, 404, "Product not found in cart")
    }

    if (!product.isActive || product.status !== "approved") {
      return sendError(res, 400, `Product "${product.title}" is not available`)
    }

    // Check if user already owns this product
    const existingOrder = await Order.findOne({
      buyer: req.user?._id,
      "items.product": product._id,
      paymentStatus: "paid",
    })

    if (existingOrder) {
      return sendError(res, 400, `You already own "${product.title}"`)
    }

    const price = product.discountPrice || product.price
    const itemTotal = price * item.quantity

    orderItems.push({
      product: product._id,
      title: product.title,
      price,
      quantity: item.quantity,
      seller: product.seller,
    })

    subtotal += itemTotal
  }

  // Calculate tax (e.g., 7.5% VAT)
  const taxRate = 0.075
  const tax = subtotal * taxRate
  const totalAmount = subtotal + tax

  // Create order
  const order = await Order.create({
    buyer: req.user?._id,
    items: orderItems,
    subtotal,
    tax,
    totalAmount,
    notes,
  })

  // Clear cart
  cart.items = []
  await cart.save()

  sendSuccess(res, 201, "Order created successfully", { order })
})

// @desc    Create order directly (without cart)
// @route   POST /api/v1/orders/direct
// @access  Private
export const createDirectOrder = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, quantity = 1, notes } = req.body

  const product = await Product.findById(productId)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  if (!product.isActive || product.status !== "approved") {
    return sendError(res, 400, "Product is not available")
  }

  // Check if user already owns this product
  const existingOrder = await Order.findOne({
    buyer: req.user?._id,
    "items.product": product._id,
    paymentStatus: "paid",
  })

  if (existingOrder) {
    return sendError(res, 400, "You already own this product")
  }

  const price = product.discountPrice || product.price
  const subtotal = price * quantity

  // Calculate tax
  const taxRate = 0.075
  const tax = subtotal * taxRate
  const totalAmount = subtotal + tax

  // Create order
  const order = await Order.create({
    buyer: req.user?._id,
    items: [
      {
        product: product._id,
        title: product.title,
        price,
        quantity,
        seller: product.seller,
      },
    ],
    subtotal,
    tax,
    totalAmount,
    notes,
  })

  sendSuccess(res, 201, "Order created successfully", { order })
})

// @desc    Get user orders
// @route   GET /api/v1/orders
// @access  Private
export const getUserOrders = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const { status, paymentStatus } = req.query

  const query: any = { buyer: req.user?._id }
  if (status) query.status = status
  if (paymentStatus) query.paymentStatus = paymentStatus

  const orders = await Order.find(query)
    .populate("items.product", "title thumbnail slug")
    .populate("items.seller", "firstName lastName businessName")
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

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product")
    .populate("items.seller", "firstName lastName businessName email")
    .populate("buyer", "firstName lastName email")

  if (!order) {
    return sendError(res, 404, "Order not found")
  }

  // Check if order belongs to user or user is seller or admin
  const isBuyer = order.buyer._id.toString() === req.user?._id.toString()
  const isSeller = order.items.some((item: any) => item.seller._id.toString() === req.user?._id.toString())
  const isAdmin = req.user?.role === "admin"

  if (!isBuyer && !isSeller && !isAdmin) {
    return sendError(res, 403, "Not authorized to view this order")
  }

  sendSuccess(res, 200, "Order retrieved successfully", { order })
})

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return sendError(res, 404, "Order not found")
  }

  // Check if order belongs to user
  if (order.buyer.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Not authorized to cancel this order")
  }

  // Can only cancel pending orders
  if (order.status !== "pending") {
    return sendError(res, 400, "Only pending orders can be cancelled")
  }

  if (order.paymentStatus === "paid") {
    return sendError(res, 400, "Cannot cancel paid orders. Please request a refund instead")
  }

  order.status = "cancelled"
  await order.save()

  sendSuccess(res, 200, "Order cancelled successfully", { order })
})

// @desc    Get seller orders
// @route   GET /api/v1/orders/seller/sales
// @access  Private (Seller)
export const getSellerOrders = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const { status, paymentStatus } = req.query

  const query: any = {
    "items.seller": req.user?._id,
    paymentStatus: "paid",
  }
  if (status) query.status = status

  const orders = await Order.find(query)
    .populate("items.product", "title thumbnail slug")
    .populate("buyer", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Order.countDocuments(query)

  // Filter items to only show seller's products
  const filteredOrders = orders.map((order) => {
    const sellerItems = order.items.filter((item: any) => item.seller.toString() === req.user?._id.toString())
    return {
      ...order.toObject(),
      items: sellerItems,
    }
  })

  sendSuccess(
    res,
    200,
    "Sales retrieved successfully",
    { orders: filteredOrders },
    {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  )
})

// @desc    Get order statistics
// @route   GET /api/v1/orders/stats
// @access  Private
export const getOrderStats = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id

  const stats = await Order.aggregate([
    { $match: { buyer: userId } },
    {
      $group: {
        _id: "$paymentStatus",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ])

  const totalOrders = await Order.countDocuments({ buyer: userId })
  const completedOrders = await Order.countDocuments({ buyer: userId, status: "completed" })
  const pendingOrders = await Order.countDocuments({ buyer: userId, status: "pending" })

  sendSuccess(res, 200, "Order statistics retrieved", {
    stats,
    totalOrders,
    completedOrders,
    pendingOrders,
  })
})
