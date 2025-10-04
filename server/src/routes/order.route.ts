import { Router } from "express"
import {
  createOrder,
  createDirectOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getSellerOrders,
  getOrderStats,
} from "../controllers/order.controller"
import { protect, authorize } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"
import { createOrderValidator, createDirectOrderValidator } from "../validators/order.validator"

const router = Router()

// All routes are protected
router.use(protect)

router.post("/", createOrderValidator, validate, createOrder)
router.post("/direct", createDirectOrderValidator, validate, createDirectOrder)
router.get("/", getUserOrders)
router.get("/stats", getOrderStats)
router.get("/seller/sales", authorize("seller", "admin"), getSellerOrders)
router.get("/:id", getOrder)
router.put("/:id/cancel", cancelOrder)

export default router
