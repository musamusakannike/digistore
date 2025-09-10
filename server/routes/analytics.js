const express = require("express")
const { getPlatformAnalytics, getSellerAnalytics } = require("../controllers/analyticsController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Routes
router.get("/platform", protect, authorize("admin"), getPlatformAnalytics)
router.get("/seller", protect, getSellerAnalytics)

module.exports = router
