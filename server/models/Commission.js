const mongoose = require("mongoose")

const commissionSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.ObjectId,
      ref: "Transaction",
      required: true,
      unique: true,
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
    // Commission details
    saleAmount: {
      type: Number,
      required: true,
      min: [0, "Sale amount cannot be negative"],
    },
    commissionRate: {
      type: Number,
      required: true,
      min: [0, "Commission rate cannot be negative"],
      max: [1, "Commission rate cannot exceed 100%"],
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: [0, "Commission amount cannot be negative"],
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
    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "disputed"],
      default: "pending",
    },
    confirmedAt: Date,
    // Metadata
    metadata: {
      paymentMethod: String,
      transactionFee: Number,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
commissionSchema.index({ transaction: 1 })
commissionSchema.index({ seller: 1, createdAt: -1 })
commissionSchema.index({ file: 1 })
commissionSchema.index({ status: 1 })
commissionSchema.index({ createdAt: -1 })

// Calculate commission amount before save
commissionSchema.pre("save", function (next) {
  if (this.isModified("saleAmount") || this.isModified("commissionRate")) {
    this.commissionAmount = this.saleAmount * this.commissionRate
    this.sellerEarning = this.saleAmount - this.commissionAmount
  }
  next()
})

module.exports = mongoose.model("Commission", commissionSchema)
