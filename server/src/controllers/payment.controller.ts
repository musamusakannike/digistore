import type { Request, Response, NextFunction } from "express"
import crypto from "crypto"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess, sendError } from "../utils/response.util"
import flutterwaveService from "../services/flutterwave.service"
import Transaction from "../models/transaction.model"
import Order from "../models/order.model"
import Product from "../models/product.model"
import User from "../models/user.model"
import { sendOrderConfirmationEmail, sendSellerSaleNotificationEmail } from "../services/email.service"
import { sendPushNotification } from "../services/notification.service"

// @desc    Initialize payment
// @route   POST /api/v1/payments/initialize
// @access  Private
export const initializePayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { orderId } = req.body

  const order = await Order.findById(orderId).populate("items.product")

  if (!order) {
    return sendError(res, 404, "Order not found")
  }

  // Check if order belongs to user
  if (order.buyer.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Not authorized to pay for this order")
  }

  // Check if order is already paid
  if (order.paymentStatus === "paid") {
    return sendError(res, 400, "Order is already paid")
  }

  // Generate unique reference
  const reference = `DIGI_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`

  // Create transaction
  const transaction = await Transaction.create({
    user: req.user._id,
    order: order._id,
    amount: order.totalAmount,
    currency: "NGN",
    paymentMethod: "flutterwave",
    reference,
    status: "pending",
  })

  // Initialize payment with Flutterwave
  const paymentData = await flutterwaveService.initializePayment({
    amount: order.totalAmount,
    currency: "NGN",
    email: req.user.email,
    name: `${req.user.firstName} ${req.user.lastName}`,
    phone: req.user.phone,
    reference,
    redirectUrl: `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`,
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
      transactionId: transaction._id.toString(),
    },
  })

  sendSuccess(res, 200, "Payment initialized successfully", {
    paymentUrl: paymentData.data.link,
    reference,
    transaction: transaction._id,
  })
})

// @desc    Verify payment
// @route   GET /api/v1/payments/verify/:reference
// @access  Private
export const verifyPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { reference } = req.params

  const referenceValue = Array.isArray(reference) ? reference[0] : reference

  const transaction = await Transaction.findOne({ reference: referenceValue }).populate({
    path: "order",
    populate: {
      path: "items.product",
      select: "title price seller files",
    },
  })

  if (!transaction) {
    return sendError(res, 404, "Transaction not found")
  }

  // Check if transaction belongs to user
  if (transaction.user.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Not authorized to verify this transaction")
  }

  // If already successful, return success
  if (transaction.status === "successful") {
    return sendSuccess(res, 200, "Payment already verified", { transaction })
  }

  // Verify with Flutterwave
  const verification = await flutterwaveService.verifyPaymentByReference(referenceValue)

  if (verification.status === "success" && verification.data.status === "successful") {
    // Update transaction
    transaction.status = "successful"
    transaction.transactionId = verification.data.id.toString()
    transaction.flutterwaveData = verification.data
    await transaction.save()

    // Update order
    const order = transaction.order as any
    order.paymentStatus = "paid"
    order.status = "completed"
    order.paidAt = new Date()
    await order.save()

    // Update product stats and seller earnings
    for (const item of order.items) {
      const product = await Product.findById(item.product._id)
      if (product) {
        product.totalSales += item.quantity
        product.totalRevenue += item.price * item.quantity
        await product.save()

        // Update seller earnings
        const seller = await User.findById(product.seller)
        if (seller) {
          const sellerEarnings = item.price * item.quantity * 0.9 // 90% to seller, 10% platform fee
          seller.totalEarnings += sellerEarnings
          seller.availableBalance += sellerEarnings
          seller.totalSales += item.quantity
          await seller.save()

          // Send notification to seller
          await sendSellerSaleNotificationEmail(seller.email, product.title, sellerEarnings)
          if (seller.expoPushToken) {
            await sendPushNotification(seller.expoPushToken, "New Sale!", `You sold ${product.title}`)
          }
        }
      }
    }

    // Send confirmation email to buyer
    await sendOrderConfirmationEmail(req.user!.email, order._id.toString(), order.totalAmount)

    // Send push notification to buyer
    if (req.user?.expoPushToken) {
      await sendPushNotification(req.user.expoPushToken, "Payment Successful!", "Your order is ready for download")
    }

    // Emit socket event
    const io = req.app.get("io")
    io.to(req.user!._id.toString()).emit("payment:success", {
      orderId: order._id,
      transactionId: transaction._id,
    })

    sendSuccess(res, 200, "Payment verified successfully", { transaction, order })
  } else {
    transaction.status = "failed"
    transaction.failureReason = verification.data.status || "Payment verification failed"
    await transaction.save()

    const order = transaction.order as any
    order.paymentStatus = "failed"
    await order.save()

    return sendError(res, 400, "Payment verification failed")
  }
})

// @desc    Flutterwave webhook
// @route   POST /api/v1/payments/webhook
// @access  Public
export const flutterwaveWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers["verif-hash"] as string

  if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
    return sendError(res, 401, "Invalid webhook signature")
  }

  const payload = req.body

  // Handle successful payment
  if (payload.event === "charge.completed" && payload.data.status === "successful") {
    const reference = payload.data.tx_ref

    const transaction = await Transaction.findOne({ reference }).populate("order")

    if (transaction && transaction.status === "pending") {
      transaction.status = "successful"
      transaction.transactionId = payload.data.id.toString()
      transaction.flutterwaveData = payload.data
      await transaction.save()

      // Update order
      const order = transaction.order as any
      order.paymentStatus = "paid"
      order.status = "completed"
      order.paidAt = new Date()
      await order.save()

      // Process order fulfillment (update stats, earnings, etc.)
      // Similar to verifyPayment logic
    }
  }

  res.status(200).json({ status: "success" })
})

// @desc    Get payment status
// @route   GET /api/v1/payments/status/:reference
// @access  Private
export const getPaymentStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { reference } = req.params

  const transaction = await Transaction.findOne({ reference }).populate("order")

  if (!transaction) {
    return sendError(res, 404, "Transaction not found")
  }

  // Check if transaction belongs to user
  if (transaction.user.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Not authorized to view this transaction")
  }

  sendSuccess(res, 200, "Payment status retrieved", { transaction })
})

// @desc    Get user transactions
// @route   GET /api/v1/payments/transactions
// @access  Private
export const getUserTransactions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = Number.parseInt(req.query.page as string) || 1
  const limit = Number.parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const { status } = req.query

  const query: any = { user: req.user?._id }
  if (status) query.status = status

  const transactions = await Transaction.find(query).populate("order").sort({ createdAt: -1 }).skip(skip).limit(limit)

  const total = await Transaction.countDocuments(query)

  sendSuccess(
    res,
    200,
    "Transactions retrieved successfully",
    { transactions },
    {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  )
})

// @desc    Request refund
// @route   POST /api/v1/payments/:transactionId/refund
// @access  Private
export const requestRefund = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { transactionId } = req.params
  const { reason } = req.body

  const transaction = await Transaction.findById(transactionId).populate("order")

  if (!transaction) {
    return sendError(res, 404, "Transaction not found")
  }

  // Check if transaction belongs to user
  if (transaction.user.toString() !== req.user?._id.toString()) {
    return sendError(res, 403, "Not authorized to refund this transaction")
  }

  if (transaction.status !== "successful") {
    return sendError(res, 400, "Only successful transactions can be refunded")
  }

  // Check if refund window is still open (e.g., 7 days)
  const refundWindow = 7 * 24 * 60 * 60 * 1000 // 7 days
  const transactionAge = Date.now() - transaction.createdAt.getTime()

  if (transactionAge > refundWindow) {
    return sendError(res, 400, "Refund window has expired")
  }

  // Process refund with Flutterwave
  const refund = await flutterwaveService.refundPayment(transaction.transactionId!)

  if (refund.status === "success") {
    transaction.status = "cancelled"
    transaction.metadata = { ...transaction.metadata, refund, refundReason: reason }
    await transaction.save()

    const order = transaction.order as any
    order.status = "refunded"
    await order.save()

    sendSuccess(res, 200, "Refund processed successfully", { transaction })
  } else {
    return sendError(res, 400, "Failed to process refund")
  }
})

// @desc    Get Flutterwave public key
// @route   GET /api/v1/payments/config
// @access  Public
export const getPaymentConfig = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  sendSuccess(res, 200, "Payment config retrieved", {
    publicKey: flutterwaveService.getPublicKey(),
  })
})
