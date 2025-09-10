const jwt = require("jsonwebtoken")
const User = require("../models/User")

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1]

      if (!token) {
        return next(new Error("Authentication error: No token provided"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return next(new Error("Authentication error: User not found"))
      }

      socket.userId = user._id.toString()
      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error: Invalid token"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.userId})`)

    // Join user to their personal room
    socket.join(`user_${socket.userId}`)

    // Join admin users to admin room
    if (socket.user.role === "admin") {
      socket.join("admin")
    }

    // Handle user status updates
    socket.on("user_online", () => {
      socket.broadcast.emit("user_status", {
        userId: socket.userId,
        status: "online",
      })
    })

    // Handle typing indicators (for future chat features)
    socket.on("typing_start", (data) => {
      socket.to(data.room).emit("user_typing", {
        userId: socket.userId,
        userName: socket.user.fullName,
      })
    })

    socket.on("typing_stop", (data) => {
      socket.to(data.room).emit("user_stop_typing", {
        userId: socket.userId,
      })
    })

    // Handle notification acknowledgment
    socket.on("notification_read", async (notificationId) => {
      try {
        const Notification = require("../models/Notification")
        await Notification.findByIdAndUpdate(notificationId, {
          isRead: true,
          readAt: new Date(),
        })

        // Broadcast to user's other devices
        socket.to(`user_${socket.userId}`).emit("notification_read", notificationId)
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    })

    // Handle bulk notification read
    socket.on("notifications_read_all", async () => {
      try {
        const Notification = require("../models/Notification")
        await Notification.updateMany({ recipient: socket.userId, isRead: false }, { isRead: true, readAt: new Date() })

        // Broadcast to user's other devices
        socket.to(`user_${socket.userId}`).emit("notifications_read_all")
      } catch (error) {
        console.error("Error marking all notifications as read:", error)
      }
    })

    // Handle file upload progress (for future use)
    socket.on("file_upload_progress", (data) => {
      socket.emit("upload_progress", data)
    })

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.user.email} (${reason})`)

      socket.broadcast.emit("user_status", {
        userId: socket.userId,
        status: "offline",
      })
    })

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error)
    })
  })

  // Helper function to send notification to specific user
  io.sendNotificationToUser = (userId, notification) => {
    io.to(`user_${userId}`).emit("notification", notification)
  }

  // Helper function to send notification to all admins
  io.sendNotificationToAdmins = (notification) => {
    io.to("admin").emit("admin_notification", notification)
  }

  // Helper function to broadcast system announcement
  io.broadcastSystemAnnouncement = (announcement) => {
    io.emit("system_announcement", announcement)
  }

  return io
}

module.exports = socketHandler
