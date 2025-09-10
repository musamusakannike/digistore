const express = require("express")
const { body } = require("express-validator")
const {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword,
  updateBankDetails,
  addPushToken,
  removePushToken,
} = require("../controllers/authController")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Validation rules
const registerValidation = [
  body("firstName").trim().isLength({ min: 2, max: 50 }).withMessage("First name must be between 2 and 50 characters"),
  body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("Last name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("university").trim().isLength({ min: 2, max: 100 }).withMessage("University name is required"),
  body("faculty").trim().isLength({ min: 2, max: 100 }).withMessage("Faculty name is required"),
  body("department").trim().isLength({ min: 2, max: 100 }).withMessage("Department name is required"),
  body("level").isIn(["100", "200", "300", "400", "500", "graduate"]).withMessage("Please select a valid level"),
  body("phoneNumber")
    .matches(/^(\+234|0)[789][01]\d{8}$/)
    .withMessage("Please provide a valid Nigerian phone number"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

const resetPasswordValidation = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]

const updateDetailsValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("university").optional().trim().isLength({ min: 2, max: 100 }).withMessage("University name is required"),
  body("faculty").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Faculty name is required"),
  body("department").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Department name is required"),
  body("level")
    .optional()
    .isIn(["100", "200", "300", "400", "500", "graduate"])
    .withMessage("Please select a valid level"),
  body("phoneNumber")
    .optional()
    .matches(/^(\+234|0)[789][01]\d{8}$/)
    .withMessage("Please provide a valid Nigerian phone number"),
]

const updatePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
]

const bankDetailsValidation = [
  body("bankName").trim().isLength({ min: 2, max: 100 }).withMessage("Bank name is required"),
  body("accountNumber").isLength({ min: 10, max: 10 }).withMessage("Account number must be 10 digits"),
  body("accountName").trim().isLength({ min: 2, max: 100 }).withMessage("Account name is required"),
  body("bankCode").isLength({ min: 3, max: 3 }).withMessage("Bank code must be 3 digits"),
]

const pushTokenValidation = [
  body("token").notEmpty().withMessage("Push token is required"),
  body("platform").isIn(["ios", "android"]).withMessage("Platform must be either ios or android"),
]

// Public routes
router.post("/register", registerValidation, register)
router.post("/login", loginValidation, login)
router.post("/refresh", refreshToken)
router.get("/verify-email/:token", verifyEmail)
router.post("/resend-verification", resendVerification)
router.post("/forgot-password", forgotPassword)
router.put("/reset-password/:resettoken", resetPasswordValidation, resetPassword)

// Protected routes
router.use(protect) // All routes after this middleware are protected

router.post("/logout", logout)
router.get("/me", getMe)
router.put("/update-details", updateDetailsValidation, updateDetails)
router.put("/update-password", updatePasswordValidation, updatePassword)
router.put("/update-bank-details", bankDetailsValidation, updateBankDetails)
router.post("/push-token", pushTokenValidation, addPushToken)
router.delete("/push-token", removePushToken)

module.exports = router
