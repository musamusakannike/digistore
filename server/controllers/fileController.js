const File = require("../models/File")
const Category = require("../models/Category")
const Transaction = require("../models/Transaction")
const User = require("../models/User")
const { uploadToS3, generateSignedUrl, deleteFromS3, uploadThumbnail } = require("../utils/s3Upload")
const { validateFile, getFileCategory, supportsThumbnail } = require("../utils/fileValidation")
const { validationResult } = require("express-validator")
const multer = require("multer")
const sharp = require("sharp")

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
  },
}).single("file")

// @desc    Upload file
// @route   POST /api/v1/files/upload
// @access  Private
const uploadFile = async (req, res, next) => {
  try {
    // Handle file upload with multer
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              error: "File size too large",
            })
          }
        }
        return res.status(400).json({
          success: false,
          error: err.message,
        })
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Please upload a file",
        })
      }

      // Validate file
      const validation = validateFile(req.file)
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        })
      }

      // Check for validation errors in other fields
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        })
      }

      try {
        // Upload file to S3
        const s3Result = await uploadToS3(req.file, "files")

        // Generate thumbnail if supported
        let thumbnailUrl = null
        if (supportsThumbnail(req.file.originalname)) {
          try {
            let thumbnailBuffer
            if (req.file.mimetype.startsWith("image/")) {
              thumbnailBuffer = await sharp(req.file.buffer)
                .resize(300, 300, { fit: "inside", withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer()
            }
            // For PDFs, you might want to use a library like pdf-poppler
            // This is a placeholder for PDF thumbnail generation

            if (thumbnailBuffer) {
              thumbnailUrl = await uploadThumbnail(thumbnailBuffer, req.file.originalname)
            }
          } catch (thumbnailError) {
            console.error("Thumbnail generation failed:", thumbnailError)
            // Continue without thumbnail
          }
        }

        // Create file record
        const file = await File.create({
          title: req.body.title,
          description: req.body.description,
          seller: req.user._id,
          category: req.body.category,
          subcategory: req.body.subcategory,
          tags: req.body.tags ? req.body.tags.split(",").map((tag) => tag.trim()) : [],
          price: req.body.price,
          fileName: s3Result.key,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          fileType: getFileCategory(req.file.originalname),
          mimeType: req.file.mimetype,
          s3Key: s3Result.key,
          s3Bucket: s3Result.bucket,
          thumbnail: thumbnailUrl,
          metaDescription: req.body.metaDescription,
        })

        await file.populate("category seller", "name firstName lastName")

        res.status(201).json({
          success: true,
          message: "File uploaded successfully",
          data: {
            file,
          },
        })
      } catch (uploadError) {
        console.error("File upload error:", uploadError)
        res.status(500).json({
          success: false,
          error: "File upload failed",
        })
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all files (public)
// @route   GET /api/v1/files
// @access  Public
const getFiles = async (req, res, next) => {
  try {
    // Build query
    const query = { status: "approved", isActive: true }

    // Filters
    if (req.query.category) {
      query.category = req.query.category
    }
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory
    }
    if (req.query.seller) {
      query.seller = req.query.seller
    }
    if (req.query.fileType) {
      query.fileType = req.query.fileType
    }
    if (req.query.tags) {
      query.tags = { $in: req.query.tags.split(",") }
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {}
      if (req.query.minPrice) query.price.$gte = Number.parseInt(req.query.minPrice)
      if (req.query.maxPrice) query.price.$lte = Number.parseInt(req.query.maxPrice)
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search }
    }

    // Pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    // Sorting
    let sort = {}
    switch (req.query.sort) {
      case "price_asc":
        sort = { price: 1 }
        break
      case "price_desc":
        sort = { price: -1 }
        break
      case "rating":
        sort = { averageRating: -1 }
        break
      case "downloads":
        sort = { downloads: -1 }
        break
      case "newest":
        sort = { createdAt: -1 }
        break
      case "oldest":
        sort = { createdAt: 1 }
        break
      default:
        sort = { isFeatured: -1, createdAt: -1 }
    }

    const files = await File.find(query)
      .populate("category subcategory", "name")
      .populate("seller", "firstName lastName university")
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select("-s3Key") // Don't expose S3 key in public API

    const total = await File.countDocuments(query)

    res.status(200).json({
      success: true,
      count: files.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: {
        files,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single file
// @route   GET /api/v1/files/:id
// @access  Public
const getFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id)
      .populate("category subcategory", "name")
      .populate("seller", "firstName lastName university faculty department")
      .populate("reviews", null, null, { sort: { createdAt: -1 } })

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      })
    }

    // Increment view count
    file.views += 1
    await file.save({ validateBeforeSave: false })

    // Don't expose S3 key in public API unless user owns the file or is admin
    const fileData = file.toObject()
    if (req.user && (req.user._id.toString() === file.seller._id.toString() || req.user.role === "admin")) {
      // User can see full details
    } else {
      delete fileData.s3Key
    }

    res.status(200).json({
      success: true,
      data: {
        file: fileData,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update file
// @route   PUT /api/v1/files/:id
// @access  Private
const updateFile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    let file = await File.findById(req.params.id)

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      })
    }

    // Check ownership
    if (file.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this file",
      })
    }

    // Update fields
    const updateFields = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      subcategory: req.body.subcategory,
      price: req.body.price,
      metaDescription: req.body.metaDescription,
    }

    // Handle tags
    if (req.body.tags) {
      updateFields.tags = req.body.tags.split(",").map((tag) => tag.trim())
    }

    // Remove undefined fields
    Object.keys(updateFields).forEach((key) => updateFields[key] === undefined && delete updateFields[key])

    // If file was rejected and being updated, reset status to pending
    if (file.status === "rejected") {
      updateFields.status = "pending"
      updateFields.rejectionReason = undefined
    }

    file = await File.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("category subcategory seller", "name firstName lastName")

    res.status(200).json({
      success: true,
      message: "File updated successfully",
      data: {
        file,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete file
// @route   DELETE /api/v1/files/:id
// @access  Private
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id)

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      })
    }

    // Check ownership
    if (file.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this file",
      })
    }

    // Check if file has been purchased
    const purchaseCount = await Transaction.countDocuments({
      file: file._id,
      status: "successful",
    })

    if (purchaseCount > 0 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        error: "Cannot delete file that has been purchased. Contact admin if needed.",
      })
    }

    try {
      // Delete from S3
      await deleteFromS3(file.s3Key)

      // Delete thumbnail if exists
      if (file.thumbnail) {
        const thumbnailKey = file.thumbnail.split("/").pop()
        await deleteFromS3(`thumbnails/${thumbnailKey}`)
      }
    } catch (s3Error) {
      console.error("S3 deletion error:", s3Error)
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await file.deleteOne()

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Download file
// @route   GET /api/v1/files/:id/download
// @access  Private
const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id)

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      })
    }

    // Check if user owns the file
    if (file.seller.toString() === req.user._id.toString()) {
      // Owner can always download
    } else {
      // Check if user has purchased the file
      const transaction = await Transaction.findOne({
        buyer: req.user._id,
        file: file._id,
        status: "successful",
      })

      if (!transaction) {
        return res.status(403).json({
          success: false,
          error: "You must purchase this file to download it",
        })
      }

      // Check download limits and expiry
      if (!transaction.canDownload) {
        return res.status(403).json({
          success: false,
          error: "Download limit exceeded or download period expired",
        })
      }

      // Update download count
      transaction.downloadCount += 1
      transaction.lastDownloadAt = new Date()
      await transaction.save()
    }

    // Generate signed URL
    const downloadUrl = await generateSignedUrl(file.s3Key, 300) // 5 minutes

    // Update file download count
    file.downloads += 1
    await file.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      data: {
        downloadUrl,
        fileName: file.originalName,
        expiresIn: 300, // seconds
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get file categories
// @route   GET /api/v1/files/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).populate("subcategories").sort({ order: 1, name: 1 })

    res.status(200).json({
      success: true,
      data: {
        categories,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search files
// @route   GET /api/v1/files/search
// @access  Public
const searchFiles = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort = "relevance" } = req.query
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 12

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      })
    }

    // Build search query
    const query = {
      $text: { $search: q },
      status: "approved",
      isActive: true,
    }

    // Add filters
    if (category) query.category = category
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseInt(minPrice)
      if (maxPrice) query.price.$lte = Number.parseInt(maxPrice)
    }

    // Build sort
    let sortQuery = {}
    switch (sort) {
      case "price_asc":
        sortQuery = { price: 1 }
        break
      case "price_desc":
        sortQuery = { price: -1 }
        break
      case "newest":
        sortQuery = { createdAt: -1 }
        break
      case "rating":
        sortQuery = { averageRating: -1 }
        break
      default:
        sortQuery = { score: { $meta: "textScore" } }
    }

    const files = await File.find(query, { score: { $meta: "textScore" } })
      .populate("category seller", "name firstName lastName")
      .sort(sortQuery)
      .limit(limit)
      .skip((page - 1) * limit)
      .select("-s3Key")

    const total = await File.countDocuments(query)

    res.status(200).json({
      success: true,
      count: files.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: {
        files,
        query: q,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  downloadFile,
  getCategories,
  searchFiles,
}
