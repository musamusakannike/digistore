const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "file_purchased",
        "file_approved",
        "file_rejected",
        "payment_received",
        "withdrawal_processed",
        "new_review",
        "system_announcement",
        "account_verification",
        "security_alert",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, "Message cannot be more than 500 characters"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    // Delivery tracking
    channels: {
      push: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    expiresAt: {
      type: Date,
      default: () => {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ isRead: 1 })
notificationSchema.index({ type: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true
  this.readAt = new Date()
  return this.save()
}

module.exports = mongoose.model("Notification", notificationSchema)
