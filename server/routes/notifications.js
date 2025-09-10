const express = require("express")
const { body } = require("express-validator")
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updatePreferences,
  sendAnnouncement,
  getNotificationAnalytics,
} = require("../controllers/notificationController")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// All routes require authentication
router.use(protect)

// Validation rules
const preferencesValidation = [
  body("email").optional().isBoolean().withMessage("Email preference must be a boolean"),
  body("push").optional().isBoolean().withMessage("Push preference must be a boolean"),
  body("sms").optional().isBoolean().withMessage("SMS preference must be a boolean"),
]

const announcementValidation = [
  body("title").trim().isLength({ min: 5, max: 100 }).withMessage("Title must be between 5 and 100 characters"),
  body("message").trim().isLength({ min: 10, max: 500 }).withMessage("Message must be between 10 and 500 characters"),
  body("priority").optional().isIn(["low", "normal", "high", "urgent"]).withMessage("Invalid priority level"),
]

// User routes
router.get("/", getNotifications)
router.put("/:id/read", markAsRead)
router.put("/read-all", markAllAsRead)
router.delete("/:id", deleteNotification)
router.put("/preferences", preferencesValidation, updatePreferences)

// Admin routes
router.post("/announcement", authorize("admin"), announcementValidation, sendAnnouncement)
router.get("/analytics", authorize("admin"), getNotificationAnalytics)

module.exports = router
