import mongoose, { type Document, Schema } from "mongoose"

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  title: string
  message: string
  type: "order" | "payment" | "product" | "review" | "system" | "promotion"
  relatedId?: mongoose.Types.ObjectId
  relatedModel?: "Order" | "Product" | "Transaction" | "Review"
  isRead: boolean
  priority: "low" | "medium" | "high"
  actionUrl?: string
  metadata?: Record<string, any>
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "payment", "product", "review", "system", "promotion"],
      required: true,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["Order", "Product", "Transaction", "Review"],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    actionUrl: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model<INotification>("Notification", notificationSchema)
