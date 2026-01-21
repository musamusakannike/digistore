import type { Request, Response, NextFunction } from "express"
import type { IUser } from "../models/user.model"
import mongoose from "mongoose"
import Product from "../models/product.model"
import Category from "../models/category.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"
import { generateSlug } from "../utils/slug.util"
import cloudinary from "../config/cloudinary.config"

type AuthRequest = Request & { user?: IUser }

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 12
  const skip = (page - 1) * limit

  const { category, seller, minPrice, maxPrice, search, sort, status, isFeatured } = req.query

  // Build query
  const query: any = { isActive: true }

  // Only show approved products to non-sellers/admins
  if (!req.user || (req.user.role !== "seller" && req.user.role !== "admin")) {
    query.status = "approved"
  }

  if (category) {
    const raw = category as string
    const parts = raw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)

    const ids = parts.filter((p) => mongoose.Types.ObjectId.isValid(p))
    const slugs = parts.filter((p) => !mongoose.Types.ObjectId.isValid(p))

    if (slugs.length > 0) {
      const categories = await Category.find({ slug: { $in: slugs } }).select("_id")
      ids.push(...categories.map((c) => c._id.toString()))
    }

    if (ids.length > 0) {
      query.category = ids.length > 1 ? { $in: ids } : ids[0]
    }
  }
  if (seller) query.seller = seller
  if (status) query.status = status
  if (isFeatured) query.isFeatured = isFeatured === "true"

  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number.parseFloat(minPrice as string)
    if (maxPrice) query.price.$lte = Number.parseFloat(maxPrice as string)
  }

  if (search) {
    query.$text = { $search: search as string }
  }

  // Sort options
  let sortOption: any = { createdAt: -1 }
  if (sort === "price-asc") sortOption = { price: 1 }
  if (sort === "price-desc") sortOption = { price: -1 }
  if (sort === "popular") sortOption = { totalSales: -1 }
  if (sort === "rating") sortOption = { averageRating: -1 }
  if (sort === "newest") sortOption = { createdAt: -1 }

  const products = await Product.find(query)
    .populate("category", "name slug")
    .populate("seller", "firstName lastName businessName avatar")
    .sort(sortOption)
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

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("seller", "firstName lastName businessName avatar bio totalSales")

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Increment view count
  product.viewCount += 1
  await product.save()

  sendSuccess(res, 200, "Product retrieved successfully", { product })
})

// @desc    Get product by slug
// @route   GET /api/v1/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category", "name slug")
    .populate("seller", "firstName lastName businessName avatar bio totalSales")

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Increment view count
  product.viewCount += 1
  await product.save()

  sendSuccess(res, 200, "Product retrieved successfully", { product })
})

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private (Seller)
export const createProduct = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { title, description, shortDescription, category, price, discountPrice, tags, metaTitle, metaDescription } =
    req.body

  // Verify category exists
  const categoryExists = await Category.findById(category)
  if (!categoryExists) {
    return sendError(res, 404, "Category not found")
  }

  // Generate slug
  const slug = await generateSlug(title, Product)

  // Create product
  const product = await Product.create({
    title,
    slug,
    description,
    shortDescription,
    category,
    seller: req.user?._id,
    price,
    discountPrice,
    tags: tags || [],
    metaTitle,
    metaDescription,
    thumbnail: "", // Will be updated when thumbnail is uploaded
    status: "draft",
  })

  sendSuccess(res, 201, "Product created successfully", { product })
})

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Seller)
export const updateProduct = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to update this product")
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
  if (tags) product.tags = tags
  if (metaTitle) product.metaTitle = metaTitle
  if (metaDescription) product.metaDescription = metaDescription
  if (isActive !== undefined) product.isActive = isActive

  // If product was rejected and now being updated, set to pending
  if (product.status === "rejected") {
    product.status = "pending"
    product.rejectionReason = undefined
  }

  await product.save()

  sendSuccess(res, 200, "Product updated successfully", { product })
})

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Seller/Admin)
export const deleteProduct = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to delete this product")
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
  await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } })

  sendSuccess(res, 200, "Product deleted successfully")
})

// @desc    Submit product for review
// @route   POST /api/v1/products/:id/submit
// @access  Private (Seller)
export const submitProduct = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Not authorized to submit this product")
  }

  // Validate product has required fields
  if (!product.thumbnail || product.files.length === 0) {
    return sendError(res, 400, "Please upload thumbnail and product files before submitting")
  }

  if (product.status !== "draft" && product.status !== "rejected") {
    return sendError(res, 400, "Product is already submitted or approved")
  }

  product.status = "pending"
  product.rejectionReason = undefined
  await product.save()

  sendSuccess(res, 200, "Product submitted for review")
})

// @desc    Get seller products
// @route   GET /api/v1/products/seller/my-products
// @access  Private (Seller)
export const getSellerProducts = asyncHandler<AuthRequest>(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 12
  const skip = (page - 1) * limit

  const { status } = req.query

  const query: any = { seller: req.user?._id }
  if (status) query.status = status

  const products = await Product.find(query)
    .populate("category", "name slug")
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

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const limit = Number.parseInt(req.query.limit as string) || 8

  const products = await Product.find({
    isFeatured: true,
    isActive: true,
    status: "approved",
  })
    .populate("category", "name slug")
    .populate("seller", "firstName lastName businessName avatar")
    .sort({ totalSales: -1 })
    .limit(limit)

  sendSuccess(res, 200, "Featured products retrieved successfully", { products })
})

// @desc    Get related products
// @route   GET /api/v1/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  const limit = Number.parseInt(req.query.limit as string) || 6

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
    status: "approved",
  })
    .populate("category", "name slug")
    .populate("seller", "firstName lastName businessName avatar")
    .sort({ totalSales: -1 })
    .limit(limit)

  sendSuccess(res, 200, "Related products retrieved successfully", { products: relatedProducts })
})
