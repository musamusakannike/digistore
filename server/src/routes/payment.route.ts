import { Router } from "express"
import {
  initializePayment,
  verifyPayment,
  flutterwaveWebhook,
  getPaymentStatus,
  getUserTransactions,
  requestRefund,
  getPaymentConfig,
} from "../controllers/payment.controller"
import { protect } from "../middlewares/auth.middleware"
import { paymentLimiter } from "../middlewares/ratelimit.middleware"

const router = Router()

// Public routes
router.get("/config", getPaymentConfig)
router.post("/webhook", flutterwaveWebhook)

// Protected routes
router.post("/initialize", protect, paymentLimiter, initializePayment)
router.get("/verify/:reference", protect, verifyPayment)
router.get("/status/:reference", protect, getPaymentStatus)
router.get("/transactions", protect, getUserTransactions)
router.post("/:transactionId/refund", protect, requestRefund)

export default router
