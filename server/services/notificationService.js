const Notification = require("../models/Notification")
const User = require("../models/User")
const { sendPushNotification, sendBulkPushNotifications } = require("./pushNotificationService")
const { sendEmailNotification, sendBulkEmailNotifications } = require("./emailService")

// Create and send notification
const createAndSendNotification = async (notificationData, io = null) => {
  try {
    // Create notification record
    const notification = await Notification.create(notificationData)

    // Get user preferences
    const user = await User.findById(notification.recipient)
    if (!user) {
      throw new Error("Recipient user not found")
    }

    const promises = []

    // Send push notification
    if (user.notificationSettings.push) {
      promises.push(sendPushNotification(user._id, notification))
    }

    // Send email notification
    if (user.notificationSettings.email) {
      promises.push(sendEmailNotification(user._id, notification))
    }

    // Send real-time notification via Socket.IO
    if (io) {
      io.sendNotificationToUser(user._id.toString(), {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt,
      })
    }

    // Wait for all notifications to be sent
    await Promise.allSettled(promises)

    return { success: true, notification }
  } catch (error) {
    console.error("Error creating and sending notification:", error)
    return { success: false, error: error.message }
  }
}

// Send bulk notifications
const sendBulkNotifications = async (userIds, notificationData, io = null) => {
  try {
    const promises = []

    // Send push notifications
    promises.push(sendBulkPushNotifications(userIds, notificationData))

    // Send email notifications
    promises.push(sendBulkEmailNotifications(userIds, notificationData))

    // Send real-time notifications via Socket.IO
    if (io) {
      userIds.forEach((userId) => {
        io.sendNotificationToUser(userId.toString(), {
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
          createdAt: new Date(),
        })
      })
    }

    const results = await Promise.allSettled(promises)

    return { success: true, results }
  } catch (error) {
    console.error("Error sending bulk notifications:", error)
    return { success: false, error: error.message }
  }
}

// Send system announcement to all users
const sendSystemAnnouncement = async (announcementData, io = null) => {
  try {
    // Get all active users
    const users = await User.find({ isActive: true }).select("_id")
    const userIds = users.map((user) => user._id)

    const notificationData = {
      type: "system_announcement",
      title: announcementData.title,
      message: announcementData.message,
      data: announcementData.data || {},
      priority: announcementData.priority || "normal",
    }

    // Send to all users
    const result = await sendBulkNotifications(userIds, notificationData, io)

    // Also broadcast via Socket.IO
    if (io) {
      io.broadcastSystemAnnouncement({
        title: announcementData.title,
        message: announcementData.message,
        data: announcementData.data,
        createdAt: new Date(),
      })
    }

    return result
  } catch (error) {
    console.error("Error sending system announcement:", error)
    return { success: false, error: error.message }
  }
}

// Notification templates for different events
const notificationTemplates = {
  file_purchased: (data) => ({
    type: "file_purchased",
    title: "Purchase Successful",
    message: `You have successfully purchased "${data.fileName}"`,
    data: {
      transactionId: data.transactionId,
      fileId: data.fileId,
      amount: data.amount,
      fileName: data.fileName,
    },
    priority: "normal",
  }),

  payment_received: (data) => ({
    type: "payment_received",
    title: "New Sale",
    message: `Your file "${data.fileName}" has been purchased`,
    data: {
      transactionId: data.transactionId,
      fileId: data.fileId,
      amount: data.earnings,
      fileName: data.fileName,
      buyer: data.buyerName,
    },
    priority: "normal",
  }),

  file_approved: (data) => ({
    type: "file_approved",
    title: "File Approved",
    message: `Your file "${data.fileName}" has been approved`,
    data: {
      fileId: data.fileId,
      fileName: data.fileName,
    },
    priority: "normal",
  }),

  file_rejected: (data) => ({
    type: "file_rejected",
    title: "File Rejected",
    message: `Your file "${data.fileName}" has been rejected`,
    data: {
      fileId: data.fileId,
      fileName: data.fileName,
      rejectionReason: data.rejectionReason,
    },
    priority: "normal",
  }),

  withdrawal_processed: (data) => ({
    type: "withdrawal_processed",
    title: "Withdrawal Update",
    message: `Your withdrawal of ₦${data.amount.toLocaleString()} has been ${data.status}`,
    data: {
      withdrawalId: data.withdrawalId,
      amount: data.amount,
      status: data.status,
      reason: data.reason,
    },
    priority: "high",
  }),

  new_review: (data) => ({
    type: "new_review",
    title: "New Review",
    message: `${data.reviewerName} left a ${data.rating}-star review on "${data.fileName}"`,
    data: {
      fileId: data.fileId,
      fileName: data.fileName,
      reviewId: data.reviewId,
      rating: data.rating,
      reviewerName: data.reviewerName,
    },
    priority: "low",
  }),

  account_verification: (data) => ({
    type: "account_verification",
    title: "Account Verification",
    message: data.message,
    data: data.data || {},
    priority: "high",
  }),

  security_alert: (data) => ({
    type: "security_alert",
    title: "Security Alert",
    message: data.message,
    data: data.data || {},
    priority: "urgent",
  }),
}

// Helper function to create notification from template
const createNotificationFromTemplate = (templateName, recipient, data) => {
  const template = notificationTemplates[templateName]
  if (!template) {
    throw new Error(`Notification template '${templateName}' not found`)
  }

  const notificationData = template(data)
  return {
    recipient,
    sender: data.sender || null,
    ...notificationData,
  }
}

module.exports = {
  createAndSendNotification,
  sendBulkNotifications,
  sendSystemAnnouncement,
  createNotificationFromTemplate,
  notificationTemplates,
}
