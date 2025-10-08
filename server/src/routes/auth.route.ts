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

const router = Router()

router.post("/register", registerValidator, validate, register)
router.post("/login", loginValidator, validate, login)
router.post("/refresh", refreshAccessToken)
router.post("/logout", protect, logout)
router.get("/verify-email/:token", verifyEmail)
router.post("/resend-verification", protect, resendVerification)
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword)
router.post("/reset-password/:token", resetPasswordValidator, validate, resetPassword)

export default router;
