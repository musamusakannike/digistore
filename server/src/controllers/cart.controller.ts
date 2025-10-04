import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import Cart from "../models/cart.model"
import Product from "../models/product.model"
import Order from "../models/order.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"

type AuthRequest = Request & { user?: IUser }

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let cart = await Cart.findOne({ user: req.user?._id }).populate("items.product")

  if (!cart) {
    cart = await Cart.create({ user: req.user?._id, items: [] })
  }

  // Calculate totals
  let subtotal = 0
  const validItems = []

  for (const item of cart.items) {
    const product = item.product as any

    if (product && product.isActive && product.status === "approved") {
      const price = product.discountPrice || product.price
      subtotal += price * item.quantity
      validItems.push(item)
    }
  }

  // Remove invalid items
  if (validItems.length !== cart.items.length) {
    cart.items = validItems as any
    await cart.save()
  }

  const taxRate = 0.075
  const tax = subtotal * taxRate
  const total = subtotal + tax

  sendSuccess(res, 200, "Cart retrieved successfully", {
    cart,
    summary: {
      itemCount: cart.items.length,
      subtotal,
      tax,
      total,
    },
  })
})

// @desc    Add item to cart
// @route   POST /api/v1/cart/items
// @access  Private
export const addToCart = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, quantity = 1 } = req.body

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

  let cart = await Cart.findOne({ user: req.user?._id })

  if (!cart) {
    cart = await Cart.create({ user: req.user?._id, items: [] })
  }

  // Check if product already in cart
  const existingItem = cart.items.find((item) => item.product.toString() === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.items.push({ product: productId, quantity })
  }

  await cart.save()
  await cart.populate("items.product")

  sendSuccess(res, 200, "Item added to cart", { cart })
})

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/items/:productId
// @access  Private
export const updateCartItem = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params
  const { quantity } = req.body

  if (quantity < 1) {
    return sendError(res, 400, "Quantity must be at least 1")
  }

  const cart = await Cart.findOne({ user: req.user?._id })

  if (!cart) {
    return sendError(res, 404, "Cart not found")
  }

  const item = cart.items.find((item) => item.product.toString() === productId)

  if (!item) {
    return sendError(res, 404, "Item not found in cart")
  }

  item.quantity = quantity
  await cart.save()
  await cart.populate("items.product")

  sendSuccess(res, 200, "Cart item updated", { cart })
})

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/items/:productId
// @access  Private
export const removeFromCart = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params

  const cart = await Cart.findOne({ user: req.user?._id })

  if (!cart) {
    return sendError(res, 404, "Cart not found")
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId)
  await cart.save()
  await cart.populate("items.product")

  sendSuccess(res, 200, "Item removed from cart", { cart })
})

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const cart = await Cart.findOne({ user: req.user?._id })

  if (!cart) {
    return sendError(res, 404, "Cart not found")
  }

  cart.items = []
  await cart.save()

  sendSuccess(res, 200, "Cart cleared successfully", { cart })
})
