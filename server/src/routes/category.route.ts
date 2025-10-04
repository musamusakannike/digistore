import { Router } from "express"
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryProductCount,
} from "../controllers/category.controller"
import { protect, authorize } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"
import { createCategoryValidator, updateCategoryValidator } from "../validators/category.validator"

const router = Router()

// Public routes
router.get("/", getCategories)
router.get("/slug/:slug", getCategoryBySlug)
router.get("/:id", getCategory)

// Admin routes
router.post("/", protect, authorize("admin"), createCategoryValidator, validate, createCategory)
router.put("/:id", protect, authorize("admin"), updateCategoryValidator, validate, updateCategory)
router.delete("/:id", protect, authorize("admin"), deleteCategory)
router.post("/:id/update-count", protect, authorize("admin"), updateCategoryProductCount)

export default router
