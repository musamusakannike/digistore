import mongoose, { type Document, Schema } from "mongoose"

export interface IOrderItem {
  product: mongoose.Types.ObjectId
  title: string
  price: number
  quantity: number
  seller: mongoose.Types.ObjectId
}

export interface IOrder extends Document {
  _id: string
  buyer: mongoose.Types.ObjectId
  items: IOrderItem[]
  subtotal: number
  tax: number
  totalAmount: number
  status: "pending" | "completed" | "cancelled" | "refunded"
  paymentStatus: "pending" | "paid" | "failed"
  paidAt?: Date
  orderNumber: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<IOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        seller: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: Date,
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
)

// Indexes
orderSchema.index({ buyer: 1 })
orderSchema.index({ "items.seller": 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ createdAt: -1 })

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments()
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(6, "0")}`
  }
  next()
})

export default mongoose.model<IOrder>("Order", orderSchema)
