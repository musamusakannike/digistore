import { Router } from "express"
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  submitProduct,
  getSellerProducts,
  getFeaturedProducts,
  getRelatedProducts,
} from "../controllers/product.controller"
import { protect, authorize, verifyEmail } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"
import { createProductValidator, updateProductValidator } from "../validators/product.validator"

const router = Router()

// Public routes
router.get("/", getProducts)
router.get("/featured", getFeaturedProducts)
router.get("/slug/:slug", getProductBySlug)
router.get("/:id", getProduct)
router.get("/:id/related", getRelatedProducts)

// Protected routes (Seller)
router.post("/", protect, authorize("seller", "admin"), verifyEmail, createProductValidator, validate, createProduct)
router.put("/:id", protect, authorize("seller", "admin"), verifyEmail, updateProductValidator, validate, updateProduct)
router.delete("/:id", protect, authorize("seller", "admin"), verifyEmail, deleteProduct)
router.post("/:id/submit", protect, authorize("seller"), verifyEmail, submitProduct)
router.get("/seller/my-products", protect, authorize("seller"), getSellerProducts)

export default router
