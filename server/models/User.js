const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please add a last name"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    avatar: {
      type: String,
      default: null,
    },
    university: {
      type: String,
      required: [true, "Please add your university"],
      trim: true,
    },
    faculty: {
      type: String,
      required: [true, "Please add your faculty"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Please add your department"],
      trim: true,
    },
    level: {
      type: String,
      enum: ["100", "200", "300", "400", "500", "graduate"],
      required: [true, "Please add your level"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please add a phone number"],
      match: [/^(\+234|0)[789][01]\d{8}$/, "Please add a valid Nigerian phone number"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Seller specific fields
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountName: String,
      bankCode: String,
    },
    earnings: {
      total: {
        type: Number,
        default: 0,
      },
      available: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      withdrawn: {
        type: Number,
        default: 0,
      },
    },
    // Notification preferences
    notificationSettings: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    // Push notification tokens
    pushTokens: [
      {
        token: String,
        platform: {
          type: String,
          enum: ["ios", "android"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Security fields
    passwordResetToken: String,
    passwordResetExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
      },
    ],
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for files uploaded
userSchema.virtual("filesUploaded", {
  ref: "File",
  localField: "_id",
  foreignField: "seller",
  count: true,
})

// Virtual for files purchased
userSchema.virtual("filesPurchased", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "buyer",
  count: true,
})

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ university: 1, faculty: 1, department: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ isActive: 1 })

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex")

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  // Set expire
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

  return resetToken
}

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex")

  this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex")
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  return verificationToken
}

// Check if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }
  }

  return this.updateOne(updates)
}

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  })
}

module.exports = mongoose.model("User", userSchema)
