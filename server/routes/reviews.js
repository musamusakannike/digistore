const express = require("express")
const { body } = require("express-validator")
const {
  createReview,
  getFileReviews,
  updateReview,
  deleteReview,
  getUserReviews,
} = require("../controllers/reviewController")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const reviewValidation = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isLength({ min: 1, max: 500 }).withMessage("Comment must be between 1 and 500 characters"),
]

const updateReviewValidation = [
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().isLength({ min: 1, max: 500 }).withMessage("Comment must be between 1 and 500 characters"),
]

// Routes
router.post("/", protect, reviewValidation, createReview)
router.get("/file/:fileId", getFileReviews)
router.get("/my-reviews", protect, getUserReviews)
router.put("/:id", protect, updateReviewValidation, updateReview)
router.delete("/:id", protect, deleteReview)

module.exports = router
