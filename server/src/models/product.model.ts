import mongoose, { type Document, Schema } from "mongoose"

export interface IProductFile {
  _id: string
  name: string
  url: string
  size: number
  type: string
  publicId: string
}

export interface IProduct extends Document {
  _id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  category: mongoose.Types.ObjectId
  seller: mongoose.Types.ObjectId
  price: number
  discountPrice?: number
  thumbnail: string
  images: string[]
  files: IProductFile[]
  tags: string[]

  // Stats
  totalSales: number
  totalRevenue: number
  viewCount: number
  downloadCount: number
  averageRating: number
  reviewCount: number

  // Status
  status: "draft" | "pending" | "approved" | "rejected" | "suspended"
  rejectionReason?: string
  isActive: boolean
  isFeatured: boolean

  // SEO
  metaTitle?: string
  metaDescription?: string

  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    thumbnail: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    files: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    totalSales: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "suspended"],
      default: "draft",
    },
    rejectionReason: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
  },
)

// Indexes
productSchema.index({ seller: 1 })
productSchema.index({ category: 1 })
productSchema.index({ status: 1 })
productSchema.index({ isActive: 1 })
productSchema.index({ isFeatured: 1 })
productSchema.index({ price: 1 })
productSchema.index({ averageRating: -1 })
productSchema.index({ totalSales: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ title: "text", description: "text", tags: "text" })

// Validate discount price
productSchema.pre("save", function (next) {
  if (this.discountPrice && this.discountPrice >= this.price) {
    next(new Error("Discount price must be less than regular price"))
  }
  next()
})

export default mongoose.model<IProduct>("Product", productSchema)
