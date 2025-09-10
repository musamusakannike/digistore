const File = require("../models/File")
const Transaction = require("../models/Transaction")
const Commission = require("../models/Commission")
const User = require("../models/User")
const Notification = require("../models/Notification")
const {
  initializePayment,
  verifyPayment,
  generatePaymentReference,
  calculateCommission,
  formatAmount,
  verifyWebhookSignature,
} = require("../utils/flutterwave")
const { validationResult } = require("express-validator")

// @desc    Initialize payment for file purchase
// @route   POST /api/v1/payments/initialize
// @access  Private
const initializeFilePayment = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { fileId } = req.body
    const buyer = req.user

    // Get file details
    const file = await File.findById(fileId).populate("seller", "firstName lastName email")

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      })
    }

    if (file.status !== "approved" || !file.isActive) {
      return res.status(400).json({
        success: false,
        error: "File is not available for purchase",
      })
    }

    // Check if buyer is trying to buy their own file
    if (file.seller._id.toString() === buyer._id.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot purchase your own file",
      })
    }

    // Check if user has already purchased this file
    const existingTransaction = await Transaction.findOne({
      buyer: buyer._id,
      file: fileId,
      status: "successful",
    })

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        error: "You have already purchased this file",
      })
    }

    // Calculate commission
    const { commissionAmount, sellerEarning } = calculateCommission(file.price)

    // Generate payment reference
    const paymentReference = generatePaymentReference("NSP_FILE")

    // Create pending transaction
    const transaction = await Transaction.create({
      buyer: buyer._id,
      seller: file.seller._id,
      file: fileId,
      amount: file.price,
      platformCommission: commissionAmount,
      sellerEarning,
      paymentReference,
      flutterwaveTransactionId: "", // Will be updated after payment initialization
      metadata: {
        userAgent: req.get("User-Agent"),
        ipAddress: req.ip,
      },
    })

    // Prepare Flutterwave payment data
    const paymentData = {
      tx_ref: paymentReference,
      amount: formatAmount(file.price),
      currency: "NGN",
      redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
      customer: {
        email: buyer.email,
        phonenumber: buyer.phoneNumber,
        name: `${buyer.firstName} ${buyer.lastName}`,
      },
      customizations: {
        title: "Digistore",
        description: `Purchase: ${file.title}`,
        logo: `${process.env.FRONTEND_URL}/logo.png`,
      },
      meta: {
        transaction_id: transaction._id.toString(),
        file_id: fileId,
        buyer_id: buyer._id.toString(),
        seller_id: file.seller._id.toString(),
      },
    }

    // Initialize payment with Flutterwave
    const flutterwaveResponse = await initializePayment(paymentData)

    if (flutterwaveResponse.status === "success") {
      // Update transaction with Flutterwave transaction ID
      transaction.flutterwaveTransactionId = flutterwaveResponse.data.id
      await transaction.save()

      res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        data: {
          paymentUrl: flutterwaveResponse.data.link,
          transactionId: transaction._id,
          paymentReference,
          amount: file.price,
          file: {
            id: file._id,
            title: file.title,
            price: file.price,
          },
        },
      })
    } else {
      // Delete the pending transaction if payment initialization failed
      await Transaction.findByIdAndDelete(transaction._id)

      res.status(400).json({
        success: false,
        error: "Payment initialization failed",
        details: flutterwaveResponse.message,
      })
    }
  } catch (error) {
    console.error("Payment initialization error:", error)
    next(error)
  }
}

// @desc    Verify payment
// @route   POST /api/v1/payments/verify
// @access  Private
const verifyFilePayment = async (req, res, next) => {
  try {
    const { transactionId, paymentReference } = req.body

    if (!transactionId && !paymentReference) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID or payment reference is required",
      })
    }

    // Find transaction
    let transaction
    if (transactionId) {
      transaction = await Transaction.findById(transactionId).populate("file seller buyer")
    } else {
      transaction = await Transaction.findOne({ paymentReference }).populate("file seller buyer")
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      })
    }

    // Check if transaction is already successful
    if (transaction.status === "successful") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          transaction,
        },
      })
    }

    // Verify payment with Flutterwave
    const flutterwaveResponse = await verifyPayment(transaction.flutterwaveTransactionId)

    if (flutterwaveResponse.status === "success" && flutterwaveResponse.data.status === "successful") {
      const paymentData = flutterwaveResponse.data

      // Update transaction
      transaction.status = "successful"
      transaction.paymentStatus = "successful"
      transaction.paidAt = new Date()
      transaction.paymentMethod = paymentData.payment_type

      await transaction.save()

      // Update seller earnings
      const seller = await User.findById(transaction.seller._id)
      seller.earnings.total += transaction.sellerEarning
      seller.earnings.available += transaction.sellerEarning
      await seller.save()

      // Create commission record
      await Commission.create({
        transaction: transaction._id,
        seller: transaction.seller._id,
        file: transaction.file._id,
        saleAmount: transaction.amount,
        commissionRate: transaction.platformCommission / transaction.amount,
        commissionAmount: transaction.platformCommission,
        sellerEarning: transaction.sellerEarning,
        status: "confirmed",
        confirmedAt: new Date(),
        metadata: {
          paymentMethod: paymentData.payment_type,
          transactionFee: paymentData.app_fee,
        },
      })

      // Create notifications
      await Promise.all([
        // Notify buyer
        Notification.create({
          recipient: transaction.buyer._id,
          type: "file_purchased",
          title: "Purchase Successful",
          message: `You have successfully purchased "${transaction.file.title}"`,
          data: {
            transactionId: transaction._id,
            fileId: transaction.file._id,
            amount: transaction.amount,
          },
        }),
        // Notify seller
        Notification.create({
          recipient: transaction.seller._id,
          sender: transaction.buyer._id,
          type: "payment_received",
          title: "New Sale",
          message: `Your file "${transaction.file.title}" has been purchased`,
          data: {
            transactionId: transaction._id,
            fileId: transaction.file._id,
            amount: transaction.sellerEarning,
            buyer: `${transaction.buyer.firstName} ${transaction.buyer.lastName}`,
          },
        }),
      ])

      // Emit real-time notifications via Socket.IO
      const io = req.app.get("io")
      if (io) {
        io.to(`user_${transaction.buyer._id}`).emit("notification", {
          type: "file_purchased",
          message: "Purchase successful",
          data: { transactionId: transaction._id },
        })

        io.to(`user_${transaction.seller._id}`).emit("notification", {
          type: "payment_received",
          message: "New sale received",
          data: { transactionId: transaction._id, amount: transaction.sellerEarning },
        })
      }

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          transaction,
        },
      })
    } else {
      // Payment failed
      transaction.status = "failed"
      transaction.paymentStatus = "failed"
      await transaction.save()

      res.status(400).json({
        success: false,
        error: "Payment verification failed",
        data: {
          transaction,
        },
      })
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    next(error)
  }
}

// @desc    Handle Flutterwave webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (but secured with signature verification)
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["verif-hash"]
    const payload = JSON.stringify(req.body)

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({
        success: false,
        error: "Invalid webhook signature",
      })
    }

    const { event, data } = req.body

    switch (event) {
      case "charge.completed":
        await handleChargeCompleted(data)
        break
      case "transfer.completed":
        await handleTransferCompleted(data)
        break
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    res.status(500).json({
      success: false,
      error: "Webhook processing failed",
    })
  }
}

// Handle charge completed webhook
const handleChargeCompleted = async (data) => {
  try {
    const transaction = await Transaction.findOne({
      paymentReference: data.tx_ref,
    }).populate("file seller buyer")

    if (!transaction) {
      console.error("Transaction not found for webhook:", data.tx_ref)
      return
    }

    if (transaction.status === "successful") {
      console.log("Transaction already processed:", transaction._id)
      return
    }

    if (data.status === "successful") {
      // Update transaction
      transaction.status = "successful"
      transaction.paymentStatus = "successful"
      transaction.paidAt = new Date()
      transaction.paymentMethod = data.payment_type
      await transaction.save()

      // Update seller earnings
      const seller = await User.findById(transaction.seller._id)
      seller.earnings.total += transaction.sellerEarning
      seller.earnings.available += transaction.sellerEarning
      await seller.save()

      // Create commission record
      await Commission.create({
        transaction: transaction._id,
        seller: transaction.seller._id,
        file: transaction.file._id,
        saleAmount: transaction.amount,
        commissionRate: transaction.platformCommission / transaction.amount,
        commissionAmount: transaction.platformCommission,
        sellerEarning: transaction.sellerEarning,
        status: "confirmed",
        confirmedAt: new Date(),
      })

      console.log("Transaction processed successfully via webhook:", transaction._id)
    } else {
      transaction.status = "failed"
      transaction.paymentStatus = "failed"
      await transaction.save()
      console.log("Transaction marked as failed via webhook:", transaction._id)
    }
  } catch (error) {
    console.error("Error handling charge completed webhook:", error)
  }
}

// Handle transfer completed webhook
const handleTransferCompleted = async (data) => {
  try {
    const Withdrawal = require("../models/Withdrawal")
    const withdrawal = await Withdrawal.findOne({
      transferReference: data.reference,
    }).populate("user")

    if (!withdrawal) {
      console.error("Withdrawal not found for webhook:", data.reference)
      return
    }

    if (data.status === "SUCCESSFUL") {
      withdrawal.status = "completed"
      withdrawal.completedAt = new Date()
      await withdrawal.save()

      // Create notification
      await Notification.create({
        recipient: withdrawal.user._id,
        type: "withdrawal_processed",
        title: "Withdrawal Completed",
        message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} has been processed successfully`,
        data: {
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
        },
      })

      console.log("Withdrawal processed successfully via webhook:", withdrawal._id)
    } else {
      withdrawal.status = "failed"
      withdrawal.failedAt = new Date()
      withdrawal.failureReason = data.complete_message || "Transfer failed"

      // Refund user's balance
      const user = await User.findById(withdrawal.user._id)
      user.earnings.available += withdrawal.amount
      user.earnings.pending -= withdrawal.amount
      await user.save()

      await withdrawal.save()

      console.log("Withdrawal marked as failed via webhook:", withdrawal._id)
    }
  } catch (error) {
    console.error("Error handling transfer completed webhook:", error)
  }
}

// @desc    Get payment analytics
// @route   GET /api/v1/payments/analytics
// @access  Private (Admin only)
const getPaymentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, period = "month" } = req.query

    // Build date filter
    const dateFilter = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    const matchStage = {
      status: "successful",
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    }

    // Overall stats
    const overallStats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          totalCommission: { $sum: "$platformCommission" },
          totalSellerEarnings: { $sum: "$sellerEarning" },
          averageTransactionValue: { $avg: "$amount" },
        },
      },
    ])

    // Revenue by period
    let groupBy
    switch (period) {
      case "day":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        }
        break
      case "week":
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        }
        break
      case "year":
        groupBy = { year: { $year: "$createdAt" } }
        break
      default:
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
    }

    const revenueByPeriod = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          transactions: { $sum: 1 },
          revenue: { $sum: "$amount" },
          commission: { $sum: "$platformCommission" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Top selling files
    const topFiles = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$file",
          sales: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "files",
          localField: "_id",
          foreignField: "_id",
          as: "file",
        },
      },
      { $unwind: "$file" },
    ])

    // Top sellers
    const topSellers = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$seller",
          sales: { $sum: 1 },
          revenue: { $sum: "$sellerEarning" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
    ])

    res.status(200).json({
      success: true,
      data: {
        overallStats: overallStats[0] || {},
        revenueByPeriod,
        topFiles,
        topSellers,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  initializeFilePayment,
  verifyFilePayment,
  handleWebhook,
  getPaymentAnalytics,
}
