import { Expo, type ExpoPushMessage } from "expo-server-sdk"
import Notification from "../models/notification.model"
import User from "../models/user.model"
import { sendEmail } from "./email.service"
import { io } from "../server"

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
})

export const createNotification = async (data: {
  user: string
  title: string
  message: string
  type: "order" | "payment" | "product" | "review" | "system" | "promotion"
  relatedId?: string
  relatedModel?: "Order" | "Product" | "Transaction" | "Review"
  priority?: "low" | "medium" | "high"
  actionUrl?: string
  metadata?: Record<string, any>
  expiresAt?: Date
}) => {
  // Create notification in database
  const notification = await Notification.create(data)

  // Send real-time notification via Socket.IO
  io.to(data.user).emit("notification", notification)

  return notification
}

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: any,
): Promise<void> => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`)
    return
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  }

  try {
    const chunks = expo.chunkPushNotifications([message])
    const tickets = []

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    }

    console.log("Push notification sent:", tickets)
  } catch (error) {
    console.error("Error sending push notification:", error)
  }
}

export const sendBulkPushNotifications = async (
  pushTokens: string[],
  title: string,
  body: string,
  data?: any,
): Promise<void> => {
  const messages: ExpoPushMessage[] = pushTokens
    .filter((token) => Expo.isExpoPushToken(token))
    .map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data,
    }))

  try {
    const chunks = expo.chunkPushNotifications(messages)
    const tickets = []

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    }

    console.log("Bulk push notifications sent:", tickets.length)
  } catch (error) {
    console.error("Error sending bulk push notifications:", error)
  }
}

export const notifyUser = async (
  userId: string,
  title: string,
  message: string,
  type: "order" | "payment" | "product" | "review" | "system" | "promotion",
  options?: {
    email?: boolean
    push?: boolean
    relatedId?: string
    relatedModel?: "Order" | "Product" | "Transaction" | "Review"
    priority?: "low" | "medium" | "high"
    actionUrl?: string
    metadata?: Record<string, any>
    emailTemplate?: string
    emailData?: Record<string, any>
  },
) => {
  try {
    // Create in-app notification
    const notification = await createNotification({
      user: userId,
      title,
      message,
      type,
      relatedId: options?.relatedId,
      relatedModel: options?.relatedModel,
      priority: options?.priority || "medium",
      actionUrl: options?.actionUrl,
      metadata: options?.metadata,
    })

    // Get user details
    const user = await User.findById(userId)
    if (!user) return

    // Send email notification if enabled
    if (options?.email && user.email) {
      await sendEmail({
        to: user.email,
        subject: title,
        text: message,
        html: options.emailTemplate || `<p>${message}</p>`,
      })
    }

    // Send push notification if enabled and user has push token
    if (options?.push && user.expoPushToken) {
      await sendPushNotification(user.expoPushToken, title, message, {
        notificationId: notification._id,
        type,
        ...options?.metadata,
      })
    }

    return notification
  } catch (error) {
    console.error("Error sending notification:", error)
  }
}
