const { Expo } = require("expo-server-sdk")
const User = require("../models/User")
const Notification = require("../models/Notification")

// Create a new Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true, // Use FCM v1 API
})

// Send push notification to a single user
const sendPushNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId)
    if (!user || !user.notificationSettings.push) {
      return { success: false, reason: "User push notifications disabled" }
    }

    const validTokens = user.pushTokens.filter((tokenObj) => Expo.isExpoPushToken(tokenObj.token))

    if (validTokens.length === 0) {
      return { success: false, reason: "No valid push tokens" }
    }

    const unreadCount = await getUnreadNotificationCount(userId)
    const messages = validTokens.map((tokenObj) => ({
      to: tokenObj.token,
      sound: "default",
      title: notification.title,
      body: notification.message,
      data: {
        notificationId: notification._id,
        type: notification.type,
        ...notification.data,
      },
      priority: notification.priority === "high" ? "high" : "normal",
      badge: unreadCount,
    }))

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages)
    const tickets = []

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
      } catch (error) {
        console.error("Error sending push notification chunk:", error)
      }
    }

    // Update notification delivery status
    await updateNotificationDeliveryStatus(notification._id, "push", tickets)

    return { success: true, tickets }
  } catch (error) {
    console.error("Push notification error:", error)
    await updateNotificationDeliveryStatus(notification._id, "push", null, error.message)
    return { success: false, error: error.message }
  }
}

// Send push notifications to multiple users
const sendBulkPushNotifications = async (userIds, notificationData) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      "notificationSettings.push": true,
    })

    const messages = []
    const notificationPromises = []

    for (const user of users) {
      const validTokens = user.pushTokens.filter((tokenObj) => Expo.isExpoPushToken(tokenObj.token))

      if (validTokens.length > 0) {
        // Create notification record
        const notification = new Notification({
          recipient: user._id,
          ...notificationData,
        })
        notificationPromises.push(notification.save())

        // Prepare push messages
        const unreadCount = await getUnreadNotificationCount(user._id)
        const userMessages = validTokens.map((tokenObj) => ({
          to: tokenObj.token,
          sound: "default",
          title: notificationData.title,
          body: notificationData.message,
          data: {
            notificationId: notification._id,
            type: notificationData.type,
            ...notificationData.data,
          },
          priority: notificationData.priority === "high" ? "high" : "normal",
          badge: unreadCount,
        }))

        messages.push(...userMessages)
      }
    }

    // Save all notifications
    await Promise.all(notificationPromises)

    // Send push notifications
    const chunks = expo.chunkPushNotifications(messages)
    const allTickets = []

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        allTickets.push(...ticketChunk)
      } catch (error) {
        console.error("Error sending bulk push notification chunk:", error)
      }
    }

    return { success: true, sent: messages.length, tickets: allTickets }
  } catch (error) {
    console.error("Bulk push notification error:", error)
    return { success: false, error: error.message }
  }
}

// Handle push notification receipts
const handlePushReceipts = async () => {
  try {
    // This would typically be called by a cron job
    // to check the status of previously sent notifications
    const notifications = await Notification.find({
      "channels.push.sent": true,
      "channels.push.receiptChecked": { $ne: true },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    })

    for (const notification of notifications) {
      // In a real implementation, you would store ticket IDs
      // and check their receipts with expo.getPushNotificationReceiptsAsync()
      // This is a simplified version
      notification.channels.push.receiptChecked = true
      await notification.save()
    }
  } catch (error) {
    console.error("Error handling push receipts:", error)
  }
}

// Clean up invalid push tokens
const cleanupInvalidTokens = async () => {
  try {
    const users = await User.find({ "pushTokens.0": { $exists: true } })

    for (const user of users) {
      const validTokens = user.pushTokens.filter((tokenObj) => Expo.isExpoPushToken(tokenObj.token))

      if (validTokens.length !== user.pushTokens.length) {
        user.pushTokens = validTokens
        await user.save()
      }
    }
  } catch (error) {
    console.error("Error cleaning up invalid tokens:", error)
  }
}

// Get unread notification count for badge
const getUnreadNotificationCount = async (userId) => {
  try {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    })
  } catch (error) {
    return 0
  }
}

// Update notification delivery status
const updateNotificationDeliveryStatus = async (notificationId, channel, tickets, error = null) => {
  try {
    const updateData = {
      [`channels.${channel}.sent`]: !error,
      [`channels.${channel}.sentAt`]: new Date(),
    }

    if (error) {
      updateData[`channels.${channel}.error`] = error
    }

    await Notification.findByIdAndUpdate(notificationId, updateData)
  } catch (updateError) {
    console.error("Error updating notification status:", updateError)
  }
}

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  handlePushReceipts,
  cleanupInvalidTokens,
  getUnreadNotificationCount,
}
