const Review = require("../models/Review")
const File = require("../models/File")
const User = require("../models/User")
const { validationResult } = require("express-validator")

// @desc    Create a review
// @route   POST /api/v1/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { fileId, rating, comment } = req.body

    // Check if file exists
    const file = await File.findById(fileId)
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    // Check if user has purchased the file
    const hasPurchased = await require("../models/Transaction").findOne({
      buyer: req.user.id,
      file: fileId,
      status: "completed",
    })

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: "You can only review files you have purchased",
      })
    }

    // Check if user has already reviewed this file
    const existingReview = await Review.findOne({
      user: req.user.id,
      file: fileId,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this file",
      })
    }

    const review = await Review.create({
      user: req.user.id,
      file: fileId,
      rating,
      comment,
    })

    await review.populate("user", "firstName lastName profilePicture")

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    })
  } catch (error) {
    console.error("Create review error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get reviews for a file
// @route   GET /api/v1/reviews/file/:fileId
// @access  Public
const getFileReviews = async (req, res) => {
  try {
    const { fileId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const reviews = await Review.find({ file: fileId })
      .populate("user", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments({ file: fileId })

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get file reviews error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      })
    }

    const { rating, comment } = req.body

    review.rating = rating || review.rating
    review.comment = comment || review.comment
    review.updatedAt = Date.now()

    await review.save()
    await review.populate("user", "firstName lastName profilePicture")

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    })
  } catch (error) {
    console.error("Update review error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      })
    }

    await review.deleteOne()

    res.json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Delete review error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get user's reviews
// @route   GET /api/v1/reviews/my-reviews
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const reviews = await Review.find({ user: req.user.id })
      .populate("file", "title thumbnail price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments({ user: req.user.id })

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get user reviews error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  createReview,
  getFileReviews,
  updateReview,
  deleteReview,
  getUserReviews,
}
