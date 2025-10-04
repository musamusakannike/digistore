import type { Request, Response, NextFunction } from "express"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.util"
import Product from "../models/product.model"

// @desc    Upload product thumbnail
// @route   POST /api/v1/products/:id/thumbnail
// @access  Private (Seller)
export const uploadThumbnail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return sendError(res, 400, "Please upload an image")
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to update this product")
  }

  // Delete old thumbnail if exists
  if (product.thumbnail) {
    const publicId = product.thumbnail.split("/").slice(-2).join("/").split(".")[0]
    await deleteFromCloudinary(publicId)
  }

  // Upload new thumbnail
  const result = await uploadToCloudinary(req.file.buffer, {
    folder: "digistore/products/thumbnails",
    width: 800,
    height: 600,
    crop: "fill",
  })

  product.thumbnail = result.secure_url
  await product.save()

  sendSuccess(res, 200, "Thumbnail uploaded successfully", { thumbnail: product.thumbnail })
})

// @desc    Upload product images
// @route   POST /api/v1/products/:id/images
// @access  Private (Seller)
export const uploadImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return sendError(res, 400, "Please upload at least one image")
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to update this product")
  }

  // Limit to 5 images
  if (product.images.length + req.files.length > 5) {
    return sendError(res, 400, "Maximum 5 images allowed per product")
  }

  const uploadedImages: string[] = []

  // Upload images
  for (const file of req.files) {
    const result = await uploadToCloudinary(file.buffer, {
      folder: "digistore/products/images",
      width: 1200,
      height: 900,
      crop: "fill",
    })
    uploadedImages.push(result.secure_url)
  }

  product.images.push(...uploadedImages)
  await product.save()

  sendSuccess(res, 200, "Images uploaded successfully", { images: product.images })
})

// @desc    Delete product image
// @route   DELETE /api/v1/products/:id/images
// @access  Private (Seller)
export const deleteImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { imageUrl } = req.body

  if (!imageUrl) {
    return sendError(res, 400, "Image URL is required")
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to update this product")
  }

  // Check if image exists
  if (!product.images.includes(imageUrl)) {
    return sendError(res, 404, "Image not found in product")
  }

  // Delete from cloudinary
  const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0]
  await deleteFromCloudinary(publicId)

  // Remove from product
  product.images = product.images.filter((img) => img !== imageUrl)
  await product.save()

  sendSuccess(res, 200, "Image deleted successfully")
})

// @desc    Upload product files
// @route   POST /api/v1/products/:id/files
// @access  Private (Seller)
export const uploadProductFiles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return sendError(res, 400, "Please upload at least one file")
  }

  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to update this product")
  }

  // Limit to 10 files
  if (product.files.length + req.files.length > 10) {
    return sendError(res, 400, "Maximum 10 files allowed per product")
  }

  const uploadedFiles: any[] = []

  // Upload files
  for (const file of req.files) {
    const result = await uploadToCloudinary(file.buffer, {
      folder: "digistore/products/files",
      resource_type: "raw",
      public_id: `${product._id}_${Date.now()}_${file.originalname}`,
    })

    uploadedFiles.push({
      name: file.originalname,
      url: result.secure_url,
      size: file.size,
      type: file.mimetype,
      publicId: result.public_id,
    })
  }

  product.files.push(...uploadedFiles)
  await product.save()

  sendSuccess(res, 200, "Files uploaded successfully", { files: product.files })
})

// @desc    Delete product file
// @route   DELETE /api/v1/products/:id/files/:fileId
// @access  Private (Seller)
export const deleteProductFile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { fileId } = req.params

  const product = await Product.findById(req.params.id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check ownership
  if (product.seller.toString() !== req.user?._id.toString() && req.user?.role !== "admin") {
    return sendError(res, 403, "Not authorized to update this product")
  }

  // Find file
  const fileIndex = product.files.findIndex((f) => f._id?.toString() === fileId)

  if (fileIndex === -1) {
    return sendError(res, 404, "File not found")
  }

  const file = product.files[fileIndex]

  // Delete from cloudinary
  await deleteFromCloudinary(file.publicId, "raw")

  // Remove from product
  product.files.splice(fileIndex, 1)
  await product.save()

  sendSuccess(res, 200, "File deleted successfully")
})

// @desc    Download product file (for purchased products)
// @route   GET /api/v1/products/:id/download/:fileId
// @access  Private
export const downloadProductFile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id, fileId } = req.params

  const product = await Product.findById(id)

  if (!product) {
    return sendError(res, 404, "Product not found")
  }

  // Check if user has purchased the product or is the seller
  const Order = (await import("../models/order.model")).default
  const hasPurchased = await Order.findOne({
    buyer: req.user?._id,
    "items.product": product._id,
    status: "completed",
  })

  const isSeller = product.seller.toString() === req.user?._id.toString()
  const isAdmin = req.user?.role === "admin"

  if (!hasPurchased && !isSeller && !isAdmin) {
    return sendError(res, 403, "You must purchase this product to download files")
  }

  // Find file
  const file = product.files.find((f) => f._id?.toString() === fileId)

  if (!file) {
    return sendError(res, 404, "File not found")
  }

  // Increment download count
  product.downloadCount += 1
  await product.save()

  // Return file URL for download
  sendSuccess(res, 200, "File ready for download", {
    file: {
      name: file.name,
      url: file.url,
      size: file.size,
      type: file.type,
    },
  })
})
