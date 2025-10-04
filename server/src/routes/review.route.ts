import { Router } from "express"
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  removeHelpfulMark,
  addSellerResponse,
  getUserReviews,
  canReviewProduct,
} from "../controllers/review.controller"
import { protect, authorize } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"
import { createReviewValidator, updateReviewValidator, sellerResponseValidator } from "../validators/review.validator"

const router = Router()

// Public routes
router.get("/product/:productId", getProductReviews)

// Protected routes
router.post("/", protect, createReviewValidator, validate, createReview)
router.put("/:id", protect, updateReviewValidator, validate, updateReview)
router.delete("/:id", protect, deleteReview)
router.post("/:id/helpful", protect, markReviewHelpful)
router.delete("/:id/helpful", protect, removeHelpfulMark)
router.post(
  "/:id/response",
  protect,
  authorize("seller", "admin"),
  sellerResponseValidator,
  validate,
  addSellerResponse,
)
router.get("/user/my-reviews", protect, getUserReviews)
router.get("/can-review/:productId", protect, canReviewProduct)

export default router
