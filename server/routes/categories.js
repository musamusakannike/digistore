const express = require("express")
const { body } = require("express-validator")
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const categoryValidation = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Category name must be between 2 and 50 characters"),
  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("parentCategory").optional().isMongoId().withMessage("Please select a valid parent category"),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Please provide a valid hex color"),
  body("order").optional().isNumeric().withMessage("Order must be a number"),
]

// Public routes
router.get("/", getCategories)
router.get("/:id", getCategory)

// Admin only routes
router.post("/", protect, authorize("admin"), categoryValidation, createCategory)
router.put("/:id", protect, authorize("admin"), categoryValidation, updateCategory)
router.delete("/:id", protect, authorize("admin"), deleteCategory)

module.exports = router
