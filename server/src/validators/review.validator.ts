import { body } from "express-validator"

export const createReviewValidator = [
  body("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Review title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Review comment is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
]

export const updateReviewValidator = [
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("title").optional().trim().isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("comment").optional().trim().isLength({ max: 1000 }).withMessage("Comment cannot exceed 1000 characters"),
]

export const sellerResponseValidator = [
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Response comment is required")
    .isLength({ max: 500 })
    .withMessage("Response cannot exceed 500 characters"),
]
