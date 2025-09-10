const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    file: {
      type: mongoose.Schema.ObjectId,
      ref: "File",
      required: true,
    },
    // Transaction details
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    platformCommission: {
      type: Number,
      required: true,
      min: [0, "Commission cannot be negative"],
    },
    sellerEarning: {
      type: Number,
      required: true,
      min: [0, "Seller earning cannot be negative"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    // Payment gateway details
    paymentGateway: {
      type: String,
      enum: ["flutterwave"],
      default: "flutterwave",
    },
    paymentReference: {
      type: String,
      required: true,
    },
    flutterwaveTransactionId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "ussd", "qr", "mobile_money"],
    },
    // Status tracking
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    // Timestamps
    paidAt: Date,
    refundedAt: Date,
    // Download tracking
    downloadCount: {
      type: Number,
      default: 0,
    },
    downloadLimit: {
      type: Number,
      default: 5,
    },
    downloadExpiry: {
      type: Date,
      default: () => {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
    },
    lastDownloadAt: Date,
    // Metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
      deviceInfo: String,
    },
  },
  {
    timestamps: true,
  },
)

// Virtual for download availability
transactionSchema.virtual("canDownload").get(function () {
  return this.status === "successful" && this.downloadCount < this.downloadLimit && this.downloadExpiry > new Date()
})

// Generate unique transaction ID
transactionSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }
  next()
})

// Indexes
transactionSchema.index({ buyer: 1 })
transactionSchema.index({ seller: 1 })
transactionSchema.index({ file: 1 })
transactionSchema.index({ transactionId: 1 })
transactionSchema.index({ paymentReference: 1 })
transactionSchema.index({ flutterwaveTransactionId: 1 })
transactionSchema.index({ status: 1 })
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ paidAt: -1 })

module.exports = mongoose.model("Transaction", transactionSchema)
