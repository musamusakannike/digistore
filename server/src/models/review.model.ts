import mongoose, { type Document, Schema } from "mongoose"

export interface IReview extends Document {
  product: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  rating: number
  title: string
  comment: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  helpfulBy: mongoose.Types.ObjectId[]
  sellerResponse?: {
    comment: string
    respondedAt: Date
  }
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sellerResponse: {
      comment: {
        type: String,
        maxlength: [500, "Response cannot exceed 500 characters"],
      },
      respondedAt: Date,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
reviewSchema.index({ product: 1 })
reviewSchema.index({ user: 1 })
reviewSchema.index({ rating: 1 })
reviewSchema.index({ isApproved: 1 })
reviewSchema.index({ createdAt: -1 })

// Compound index to prevent duplicate reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

// Update product rating after review is saved
reviewSchema.post("save", async function () {
  const Review = mongoose.model("Review")
  const Product = mongoose.model("Product")

  const stats = await Review.aggregate([
    { $match: { product: this.product, isApproved: true } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ])

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    })
  }
})

// Update product rating after review is deleted
reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
  const Review = mongoose.model("Review")
  const Product = mongoose.model("Product")

  const stats = await Review.aggregate([
    { $match: { product: this.product, isApproved: true } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ])

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    })
  } else {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: 0,
      reviewCount: 0,
    })
  }
})

export default mongoose.model<IReview>("Review", reviewSchema)
