const mongoose = require("mongoose")

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please specify withdrawal amount"],
      min: [Number.parseInt(process.env.MINIMUM_WITHDRAWAL_AMOUNT) || 5000, "Minimum withdrawal amount is ₦5,000"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
    // Bank details
    bankDetails: {
      bankName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      accountName: {
        type: String,
        required: true,
      },
      bankCode: {
        type: String,
        required: true,
      },
    },
    // Status tracking
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    // Processing details
    processedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    processedAt: Date,
    completedAt: Date,
    failedAt: Date,
    // Payment gateway details
    paymentGateway: {
      type: String,
      enum: ["flutterwave"],
      default: "flutterwave",
    },
    transferReference: String,
    transferId: String,
    transferFee: {
      type: Number,
      default: 0,
    },
    // Notes and reasons
    adminNotes: {
      type: String,
      maxlength: [1000, "Admin notes cannot be more than 1000 characters"],
    },
    failureReason: {
      type: String,
      maxlength: [500, "Failure reason cannot be more than 500 characters"],
    },
    cancellationReason: {
      type: String,
      maxlength: [500, "Cancellation reason cannot be more than 500 characters"],
    },
    // Metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
withdrawalSchema.index({ user: 1, createdAt: -1 })
withdrawalSchema.index({ status: 1 })
withdrawalSchema.index({ createdAt: -1 })
withdrawalSchema.index({ transferReference: 1 })

// Pre-save middleware to validate user has sufficient balance
withdrawalSchema.pre("save", async function (next) {
  if (this.isNew) {
    const User = mongoose.model("User")
    const user = await User.findById(this.user)

    if (!user) {
      return next(new Error("User not found"))
    }

    if (user.earnings.available < this.amount) {
      return next(new Error("Insufficient balance for withdrawal"))
    }
  }
  next()
})

module.exports = mongoose.model("Withdrawal", withdrawalSchema)
