import mongoose, { type Document, Schema } from "mongoose"

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  icon?: string
  isActive: boolean
  productCount: number
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    icon: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
categorySchema.index({ isActive: 1 })

export default mongoose.model<ICategory>("Category", categorySchema)
