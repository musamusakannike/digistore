const mongoose = require("mongoose")

const fileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a file title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a file description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Please select a category"],
    },
    subcategory: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [100, "Price must be at least ₦100"],
      max: [1000000, "Price cannot exceed ₦1,000,000"],
    },
    // File details
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    // AWS S3 details
    s3Key: {
      type: String,
      required: true,
    },
    s3Bucket: {
      type: String,
      required: true,
    },
    // Preview/thumbnail
    thumbnail: {
      type: String,
      default: null,
    },
    preview: {
      type: String,
      default: null,
    },
    // Status and visibility
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    // Ratings
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 5"],
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    // Admin fields
    adminNotes: {
      type: String,
      maxlength: [1000, "Admin notes cannot be more than 1000 characters"],
    },
    rejectionReason: {
      type: String,
      maxlength: [500, "Rejection reason cannot be more than 500 characters"],
    },
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    // SEO fields
    slug: {
      type: String,
      unique: true,
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot be more than 160 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for reviews
fileSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "file",
})

// Virtual for purchases
fileSchema.virtual("purchases", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "file",
})

// Create slug from title
fileSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }
  next()
})

// Indexes
fileSchema.index({ seller: 1 })
fileSchema.index({ category: 1 })
fileSchema.index({ status: 1 })
fileSchema.index({ isActive: 1 })
fileSchema.index({ isFeatured: 1 })
fileSchema.index({ createdAt: -1 })
fileSchema.index({ price: 1 })
fileSchema.index({ averageRating: -1 })
fileSchema.index({ downloads: -1 })
fileSchema.index({ views: -1 })
fileSchema.index({ slug: 1 })
fileSchema.index({ tags: 1 })

// Text search index
fileSchema.index({
  title: "text",
  description: "text",
  tags: "text",
})

module.exports = mongoose.model("File", fileSchema)
