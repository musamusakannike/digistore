const express = require("express")
const { body } = require("express-validator")
const {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  downloadFile,
  getCategories,
  searchFiles,
} = require("../controllers/fileController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const fileUploadValidation = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),
  body("category").isMongoId().withMessage("Please select a valid category"),
  body("subcategory").optional().isMongoId().withMessage("Please select a valid subcategory"),
  body("price")
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => {
      if (value < 100) throw new Error("Minimum price is ₦100")
      if (value > 1000000) throw new Error("Maximum price is ₦1,000,000")
      return true
    }),
  body("metaDescription")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description cannot exceed 160 characters"),
]

const fileUpdateValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),
  body("category").optional().isMongoId().withMessage("Please select a valid category"),
  body("subcategory").optional().isMongoId().withMessage("Please select a valid subcategory"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => {
      if (value < 100) throw new Error("Minimum price is ₦100")
      if (value > 1000000) throw new Error("Maximum price is ₦1,000,000")
      return true
    }),
  body("metaDescription")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description cannot exceed 160 characters"),
]

// Public routes
router.get("/", getFiles)
router.get("/categories", getCategories)
router.get("/search", searchFiles)
router.get("/:id", getFile)

// Protected routes
router.post("/upload", protect, fileUploadValidation, uploadFile)
router.put("/:id", protect, fileUpdateValidation, updateFile)
router.delete("/:id", protect, deleteFile)
router.get("/:id/download", protect, downloadFile)

module.exports = router
