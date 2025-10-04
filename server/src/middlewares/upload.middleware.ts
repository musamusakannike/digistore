import multer from "multer"
import path from "path"
import { sendError } from "../utils/response.util"
import type { Request, Response, NextFunction } from "express"
import type { Express } from "express"

// Configure multer for memory storage
const storage = multer.memoryStorage()

// File filter for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"))
  }
}

// File filter for digital products
const productFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || [
    "pdf",
    "doc",
    "docx",
    "zip",
    "rar",
    "mp4",
    "mp3",
    "jpg",
    "png",
    "epub",
    "mobi",
  ]

  const extname = path.extname(file.originalname).toLowerCase().substring(1)
  const isAllowed = allowedTypes.includes(extname)

  if (isAllowed) {
    return cb(null, true)
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(", ")}`))
  }
}

// Max file size from env or default to 100MB
const maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE || "104857600")

// Upload middleware for images
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for images
  fileFilter: imageFilter,
})

// Upload middleware for product files
export const uploadProductFile = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: productFileFilter,
})

// Error handler for multer
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, 400, "File size too large")
    }
    return sendError(res, 400, err.message)
  } else if (err) {
    return sendError(res, 400, err.message)
  }
  next()
}
