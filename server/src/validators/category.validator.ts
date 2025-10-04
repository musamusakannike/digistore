import { body } from "express-validator"

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 50 })
    .withMessage("Category name cannot exceed 50 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("icon").optional().trim(),
]

export const updateCategoryValidator = [
  body("name").optional().trim().isLength({ max: 50 }).withMessage("Category name cannot exceed 50 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("icon").optional().trim(),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
]
