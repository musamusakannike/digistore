const express = require("express")
const { body } = require("express-validator")
const {
  initializeFilePayment,
  verifyFilePayment,
  handleWebhook,
  getPaymentAnalytics,
} = require("../controllers/paymentController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const initializePaymentValidation = [body("fileId").isMongoId().withMessage("Please provide a valid file ID")]

const verifyPaymentValidation = [
  body("transactionId").optional().isMongoId().withMessage("Please provide a valid transaction ID"),
  body("paymentReference").optional().isString().withMessage("Please provide a valid payment reference"),
]

// Public routes
router.post("/webhook", handleWebhook)

// Protected routes
router.post("/initialize", protect, initializePaymentValidation, initializeFilePayment)
router.post("/verify", protect, verifyPaymentValidation, verifyFilePayment)

// Admin only routes
router.get("/analytics", protect, authorize("admin"), getPaymentAnalytics)

module.exports = router
