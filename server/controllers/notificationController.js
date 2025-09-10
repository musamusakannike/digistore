const Notification = require("../models/Notification")
const { sendSystemAnnouncement } = require("../services/notificationService")
const { validationResult } = require("express-validator")

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const type = req.query.type
    const isRead = req.query.isRead

    // Build query
    const query = { recipient: req.user._id }
    if (type) query.type = type
    if (isRead !== undefined) query.isRead = isRead === "true"

    const notifications = await Notification.find(query)
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    })

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: {
        notifications,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      })
    }

    if (!notification.isRead) {
      notification.isRead = true
      notification.readAt = new Date()
      await notification.save()
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() })

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      })
    }

    await notification.deleteOne()

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update notification preferences
// @route   PUT /api/v1/notifications/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { email, push, sms } = req.body

    const User = require("../models/User")
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        notificationSettings: {
          email: email !== undefined ? email : req.user.notificationSettings.email,
          push: push !== undefined ? push : req.user.notificationSettings.push,
          sms: sms !== undefined ? sms : req.user.notificationSettings.sms,
        },
      },
      { new: true },
    )

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: {
        notificationSettings: user.notificationSettings,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Send system announcement (Admin only)
// @route   POST /api/v1/notifications/announcement
// @access  Private (Admin only)
const sendAnnouncement = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { title, message, priority, data } = req.body
    const io = req.app.get("io")

    const result = await sendSystemAnnouncement(
      {
        title,
        message,
        priority,
        data,
      },
      io,
    )

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "System announcement sent successfully",
        data: result,
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to send system announcement",
        details: result.error,
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Get notification analytics (Admin only)
// @route   GET /api/v1/notifications/analytics
// @access  Private (Admin only)
const getNotificationAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query

    // Build date filter
    const dateFilter = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

    // Overall stats
    const overallStats = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: 1 },
          readNotifications: { $sum: { $cond: ["$isRead", 1, 0] } },
          unreadNotifications: { $sum: { $cond: ["$isRead", 0, 1] } },
        },
      },
    ])

    // Notifications by type
    const notificationsByType = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          readCount: { $sum: { $cond: ["$isRead", 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Delivery success rates
    const deliveryStats = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          pushSent: { $sum: { $cond: ["$channels.push.sent", 1, 0] } },
          emailSent: { $sum: { $cond: ["$channels.email.sent", 1, 0] } },
          smsSent: { $sum: { $cond: ["$channels.sms.sent", 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ])

    // Daily notification counts
    const dailyStats = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          readCount: { $sum: { $cond: ["$isRead", 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    res.status(200).json({
      success: true,
      data: {
        overallStats: overallStats[0] || {},
        notificationsByType,
        deliveryStats: deliveryStats[0] || {},
        dailyStats,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updatePreferences,
  sendAnnouncement,
  getNotificationAnalytics,
}
