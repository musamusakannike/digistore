const express = require("express")
const { body } = require("express-validator")
const {
  getProfile,
  getEarnings,
  requestWithdrawal,
  getUserFiles,
  getUserPurchases,
  getDashboardStats,
} = require("../controllers/userController")
const { protect } = require("../middleware/auth")

const router = express.Router()

// All routes are protected
router.use(protect)

// Validation rules
const withdrawalValidation = [
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => {
      const minAmount = Number.parseInt(process.env.MINIMUM_WITHDRAWAL_AMOUNT) || 5000
      if (value < minAmount) {
        throw new Error(`Minimum withdrawal amount is ₦${minAmount.toLocaleString()}`)
      }
      return true
    }),
]

// Routes
router.get("/profile", getProfile)
router.get("/earnings", getEarnings)
router.post("/withdraw", withdrawalValidation, requestWithdrawal)
router.get("/files", getUserFiles)
router.get("/purchases", getUserPurchases)
router.get("/dashboard", getDashboardStats)

module.exports = router
