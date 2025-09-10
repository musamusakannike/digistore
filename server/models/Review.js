const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    file: {
      type: mongoose.Schema.ObjectId,
      ref: "File",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.ObjectId,
      ref: "Transaction",
      required: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 5"],
      required: [true, "Please add a rating"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Review title cannot be more than 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
      maxlength: [1000, "Comment cannot be more than 1000 characters"],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Moderation
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,
    moderationNotes: {
      type: String,
      maxlength: [500, "Moderation notes cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Ensure one review per user per file
reviewSchema.index({ user: 1, file: 1 }, { unique: true })

// Other indexes
reviewSchema.index({ file: 1 })
reviewSchema.index({ rating: -1 })
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ isActive: 1 })

// Update file's average rating after save
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.file)
})

// Update file's average rating after remove
reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRating(this.file)
})

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (fileId) {
  const obj = await this.aggregate([
    {
      $match: { file: fileId, isActive: true },
    },
    {
      $group: {
        _id: "$file",
        averageRating: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
      },
    },
  ])

  try {
    if (obj.length > 0) {
      await this.model("File").findByIdAndUpdate(fileId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10,
        ratingsCount: obj[0].ratingsCount,
      })
    } else {
      await this.model("File").findByIdAndUpdate(fileId, {
        averageRating: 0,
        ratingsCount: 0,
      })
    }
  } catch (err) {
    console.error("Error updating file rating:", err)
  }
}

module.exports = mongoose.model("Review", reviewSchema)
