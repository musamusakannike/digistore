import Product from "../models/product.model"
import { deleteFromCloudinary, deleteMultipleFromCloudinary } from "../utils/cloudinary.util"

export const deleteProductFiles = async (productId: string): Promise<void> => {
  const product = await Product.findById(productId)

  if (!product) {
    throw new Error("Product not found")
  }

  // Delete all product files
  if (product.files && product.files.length > 0) {
    const publicIds = product.files.map((file) => file.publicId)
    await deleteMultipleFromCloudinary(publicIds, "raw")
  }

  // Delete thumbnail
  if (product.thumbnail) {
    const publicId = product.thumbnail.split("/").slice(-2).join("/").split(".")[0]
    await deleteFromCloudinary(publicId)
  }

  // Delete images
  if (product.images && product.images.length > 0) {
    const publicIds = product.images.map((image) => image.split("/").slice(-2).join("/").split(".")[0])
    await deleteMultipleFromCloudinary(publicIds)
  }
}

export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize
}

export const validateFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.some((type) => mimetype.includes(type))
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase()
}
