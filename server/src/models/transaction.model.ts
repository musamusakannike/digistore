import mongoose, { type Document, Schema } from "mongoose"

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  amount: number
  currency: string
  paymentMethod: string
  paymentGateway: "flutterwave"
  status: "pending" | "successful" | "failed" | "cancelled"
  reference: string
  transactionId?: string
  flutterwaveData?: any
  metadata?: any
  failureReason?: string
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "NGN",
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ["flutterwave"],
      default: "flutterwave",
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled"],
      default: "pending",
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: String,
    flutterwaveData: Schema.Types.Mixed,
    metadata: Schema.Types.Mixed,
    failureReason: String,
  },
  {
    timestamps: true,
  },
)

// Indexes
transactionSchema.index({ user: 1 })
transactionSchema.index({ order: 1 })
transactionSchema.index({ status: 1 })
transactionSchema.index({ createdAt: -1 })

export default mongoose.model<ITransaction>("Transaction", transactionSchema)
