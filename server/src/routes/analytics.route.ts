import { Router } from "express"
import { getSellerAnalytics, getBuyerAnalytics } from "../controllers/analytics.controller"
import { protect, authorize } from "../middlewares/auth.middleware"

const router = Router()

// All routes are protected
router.use(protect)

router.get("/seller", authorize("seller", "admin"), getSellerAnalytics)
router.get("/buyer", getBuyerAnalytics)

export default router
