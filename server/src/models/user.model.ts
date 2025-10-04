import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: "buyer" | "seller" | "admin"
  avatar?: string
  bio?: string
  phone?: string
  isEmailVerified: boolean
  isActive: boolean
  isSuspended: boolean
  suspensionReason?: string

  // Seller specific fields
  businessName?: string
  businessDescription?: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  totalEarnings: number
  availableBalance: number
  totalSales: number

  // Buyer specific fields
  wishlist: mongoose.Types.ObjectId[]

  // Push notification token
  expoPushToken?: string

  // Security
  passwordResetToken?: string
  passwordResetExpire?: Date
  emailVerificationToken?: string
  emailVerificationExpire?: Date
  refreshToken?: string

  // Timestamps
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: String,

    // Seller fields
    businessName: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String,
      maxlength: [1000, "Business description cannot exceed 1000 characters"],
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },

    // Buyer fields
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    expoPushToken: String,

    // Security
    passwordResetToken: String,
    passwordResetExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    refreshToken: String,

    lastLogin: Date,
  },
  {
    timestamps: true,
  },
)

// Indexes
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

export default mongoose.model<IUser>("User", userSchema)
