import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import Review from "../models/review.model"
import Product from "../models/product.model"
import Order from "../models/order.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"

type AuthRequest = Request & { user?: IUser }

// @desc    Get product reviews
// @route   GET /api/v1/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const { rating, sort } = req.query

  const query: any = { product: productId, isApproved: true }
  if (rating) query.rating = Number.parseInt(rating as string)

  let sortOption: any = { createdAt: -1 }
  if (sort === "helpful") sortOption = { helpfulCount: -1 }
  if (sort === "rating-high") sortOption = { rating: -1 }
  if (sort === "rating-low") sortOption = { rating: 1 }

  const reviews = await Review.find(query)
    .populate("user", "firstName lastName avatar")
    .sort(sortOption)
    .skip(skip)
    .limit(limit)

  const total = await Review.countDocuments(query)

  // Get rating distribution
  const ratingStats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ])

  sendSuccess(
    res,
    200,
    "Reviews retrieved successfully",
    { reviews, ratingStats },
    {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  )
})

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Private
export const createReview = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, rating, title, comment } = req.body

  const product = await Product.findById(productId)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user?._id,
  })

  if (existingReview) {
    return sendError(res, 400, "You have already reviewed this product")
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    buyer: req.user?._id,
    "items.product": productId,
    paymentStatus: "paid",
  })

  const review = await Review.create({
    product: productId,
    user: req.user?._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: !!hasPurchased,
  })

  await review.populate("user", "firstName lastName avatar")

  sendSuccess(res, 201, "Review created successfully", { review })
})

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
export const updateReview = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return sendError(res, 404, "Review not found")
  }

  // Check if review belongs to user
  if (review.user.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Not authorized to update this review")
  }

  const { rating, title, comment } = req.body

  if (rating) review.rating = rating
  if (title) review.title = title
  if (comment) review.comment = comment

  await review.save()
  await review.populate("user", "firstName lastName avatar")

  sendSuccess(res, 200, "Review updated successfully", { review })
})

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return sendError(res, 404, "Review not found")
  }

  // Check if review belongs to user or user is admin
  if (review.user.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to delete this review")
  }

  await review.deleteOne()

  sendSuccess(res, 200, "Review deleted successfully")
})

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
export const markReviewHelpful = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return sendError(res, 404, "Review not found")
  }

  // Check if user already marked as helpful
  if (review.helpfulBy.includes(req.user?._id as any)) {
    return sendError(res, 400, "You have already marked this review as helpful")
  }

  review.helpfulBy.push(req.user?._id as any)
  review.helpfulCount += 1
  await review.save()

  sendSuccess(res, 200, "Review marked as helpful")
})

// @desc    Remove helpful mark from review
// @route   DELETE /api/v1/reviews/:id/helpful
// @access  Private
export const removeHelpfulMark = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return sendError(res, 404, "Review not found")
  }

  // Check if user marked as helpful
  if (!review.helpfulBy.includes(req.user?._id as any)) {
    return sendError(res, 400, "You have not marked this review as helpful")
  }

  review.helpfulBy = review.helpfulBy.filter((id) => id.toString() !== req.user?._id.toString())
  review.helpfulCount -= 1
  await review.save()

  sendSuccess(res, 200, "Helpful mark removed")
})

// @desc    Add seller response to review
// @route   POST /api/v1/reviews/:id/response
// @access  Private (Seller)
export const addSellerResponse = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { comment } = req.body

  const review = await Review.findById(req.params.id).populate("product")

  if (!review) {
    return sendError(res, 404, "Review not found")
  }

  const product = review.product as any

  // Check if user is the seller of the product
  if (product.seller.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Only the product seller can respond to reviews")
  }

  review.sellerResponse = {
    comment,
    respondedAt: new Date(),
  }

  await review.save()
  await review.populate("user", "firstName lastName avatar")

  sendSuccess(res, 200, "Response added successfully", { review })
})

// @desc    Get user reviews
// @route   GET /api/v1/reviews/user/my-reviews
// @access  Private
export const getUserReviews = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const reviews = await Review.find({ user: req.user?._id })
    .populate("product", "title thumbnail slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Review.countDocuments({ user: req.user?._id })

  sendSuccess(
    res,
    200,
    "Reviews retrieved successfully",
    { reviews },
    {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  )
})

// @desc    Check if user can review product
// @route   GET /api/v1/reviews/can-review/:productId
// @access  Private
export const canReviewProduct = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user?._id,
  })

  if (existingReview) {
    return sendSuccess(res, 200, "Review status checked", {
      canReview: false,
      reason: "already_reviewed",
      existingReview,
    })
  }

  // Check if user purchased
  const hasPurchased = await Order.findOne({
    buyer: req.user?._id,
    "items.product": productId,
    paymentStatus: "paid",
  })

  if (!hasPurchased) {
    return sendSuccess(res, 200, "Review status checked", {
      canReview: false,
      reason: "not_purchased",
    })
  }

  sendSuccess(res, 200, "Review status checked", {
    canReview: true,
  })
})
