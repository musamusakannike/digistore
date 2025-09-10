const express = require("express")
const { body } = require("express-validator")
const {
  processWithdrawal,
  getWithdrawals,
  getWithdrawal,
  cancelWithdrawal,
  getBanksList,
  resolveAccount,
} = require("../controllers/withdrawalController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect)
router.use(authorize("admin"))

// Withdrawal management
router.get("/withdrawals", getWithdrawals)
router.get("/withdrawals/:id", getWithdrawal)
router.post("/withdrawals/:id/process", processWithdrawal)
router.put(
  "/withdrawals/:id/cancel",
  [body("reason").optional().trim().isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters")],
  cancelWithdrawal,
)

// Bank utilities
router.get("/banks", getBanksList)
router.post(
  "/resolve-account",
  [
    body("accountNumber").isLength({ min: 10, max: 10 }).withMessage("Account number must be 10 digits"),
    body("bankCode").isLength({ min: 3, max: 3 }).withMessage("Bank code must be 3 digits"),
  ],
  resolveAccount,
)

module.exports = router
