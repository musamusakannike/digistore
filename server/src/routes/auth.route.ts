import { Router } from "express"
import {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller"
import { protect } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator"
import { authLimiter } from "../middlewares/ratelimit.middleware"

const router = Router()

router.post("/register", authLimiter, registerValidator, validate, register)
router.post("/login", authLimiter, loginValidator, validate, login)
router.post("/refresh", refreshAccessToken)
router.post("/logout", protect, logout)
router.get("/verify-email/:token", verifyEmail)
router.post("/resend-verification", protect, resendVerification)
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, forgotPassword)
router.post("/reset-password/:token", authLimiter, resetPasswordValidator, validate, resetPassword)

export default router
