import { body } from "express-validator"

export const createProductValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),
  body("shortDescription")
    .trim()
    .notEmpty()
    .withMessage("Short description is required")
    .isLength({ max: 300 })
    .withMessage("Short description cannot exceed 300 characters"),
  body("category").trim().notEmpty().withMessage("Category is required").isMongoId().withMessage("Invalid category ID"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("discountPrice").optional().isFloat({ min: 0 }).withMessage("Discount price must be a positive number"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
]

export const updateProductValidator = [
  body("title").optional().trim().isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),
  body("shortDescription")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Short description cannot exceed 300 characters"),
  body("category").optional().trim().isMongoId().withMessage("Invalid category ID"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("discountPrice").optional().isFloat({ min: 0 }).withMessage("Discount price must be a positive number"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
]
