import { Router } from "express"
import {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAllProducts,
  approveProduct,
  rejectProduct,
  suspendProduct,
  toggleFeaturedProduct,
  getAllOrders,
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
} from "../controllers/admin.controller"
import { protect, authorize } from "../middlewares/auth.middleware"

const router = Router()

// All routes are protected and admin only
router.use(protect, authorize("admin"))

// User management
router.get("/users", getAllUsers)
router.get("/users/:id", getUserDetails)
router.put("/users/:id/status", updateUserStatus)
router.delete("/users/:id", deleteUser)

// Product management
router.get("/products", getAllProducts)
router.put("/products/:id/approve", approveProduct)
router.put("/products/:id/reject", rejectProduct)
router.put("/products/:id/suspend", suspendProduct)
router.put("/products/:id/featured", toggleFeaturedProduct)
router.put("/products/:id", updateProduct)
router.delete("/products/:id", deleteProduct)
router.get("/products/:id", getProduct)

// Order management
router.get("/orders", getAllOrders)

// Dashboard stats
router.get("/stats", getDashboardStats)

export default router
