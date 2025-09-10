const Withdrawal = require("../models/Withdrawal")
const User = require("../models/User")
const Notification = require("../models/Notification")
const { initiateTransfer, resolveBankAccount, getBanks } = require("../utils/flutterwave")
const { validationResult } = require("express-validator")

// @desc    Process withdrawal request
// @route   POST /api/v1/admin/withdrawals/:id/process
// @access  Private (Admin only)
const processWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id).populate("user")

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      })
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Withdrawal request is not in pending status",
      })
    }

    // Verify bank account
    try {
      const accountVerification = await resolveBankAccount(
        withdrawal.bankDetails.accountNumber,
        withdrawal.bankDetails.bankCode,
      )

      if (accountVerification.status !== "success") {
        return res.status(400).json({
          success: false,
          error: "Bank account verification failed",
        })
      }
    } catch (verificationError) {
      return res.status(400).json({
        success: false,
        error: "Bank account verification failed",
      })
    }

    // Update withdrawal status to processing
    withdrawal.status = "processing"
    withdrawal.processedBy = req.user._id
    withdrawal.processedAt = new Date()
    await withdrawal.save()

    // Prepare transfer data
    const transferReference = `WD_${withdrawal._id}_${Date.now()}`
    const transferData = {
      account_bank: withdrawal.bankDetails.bankCode,
      account_number: withdrawal.bankDetails.accountNumber,
      amount: withdrawal.amount,
      narration: `Withdrawal from Digistore - ${withdrawal._id}`,
      currency: "NGN",
      reference: transferReference,
      callback_url: `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
      debit_currency: "NGN",
    }

    try {
      // Initiate transfer with Flutterwave
      const transferResponse = await initiateTransfer(transferData)

      if (transferResponse.status === "success") {
        // Update withdrawal with transfer details
        withdrawal.transferReference = transferReference
        withdrawal.transferId = transferResponse.data.id
        withdrawal.transferFee = transferResponse.data.fee || 0
        await withdrawal.save()

        // Create notification
        await Notification.create({
          recipient: withdrawal.user._id,
          type: "withdrawal_processed",
          title: "Withdrawal Processing",
          message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} is being processed`,
          data: {
            withdrawalId: withdrawal._id,
            amount: withdrawal.amount,
          },
        })

        res.status(200).json({
          success: true,
          message: "Withdrawal processing initiated successfully",
          data: {
            withdrawal,
            transferResponse: transferResponse.data,
          },
        })
      } else {
        // Transfer initiation failed
        withdrawal.status = "failed"
        withdrawal.failedAt = new Date()
        withdrawal.failureReason = transferResponse.message || "Transfer initiation failed"

        // Refund user's balance
        const user = await User.findById(withdrawal.user._id)
        user.earnings.available += withdrawal.amount
        user.earnings.pending -= withdrawal.amount
        await user.save()

        await withdrawal.save()

        res.status(400).json({
          success: false,
          error: "Transfer initiation failed",
          details: transferResponse.message,
        })
      }
    } catch (transferError) {
      console.error("Transfer error:", transferError)

      // Mark withdrawal as failed and refund balance
      withdrawal.status = "failed"
      withdrawal.failedAt = new Date()
      withdrawal.failureReason = "Transfer service error"

      const user = await User.findById(withdrawal.user._id)
      user.earnings.available += withdrawal.amount
      user.earnings.pending -= withdrawal.amount
      await user.save()

      await withdrawal.save()

      res.status(500).json({
        success: false,
        error: "Transfer processing failed",
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Get all withdrawal requests
// @route   GET /api/v1/admin/withdrawals
// @access  Private (Admin only)
const getWithdrawals = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const status = req.query.status
    const sort = req.query.sort || "-createdAt"

    // Build query
    const query = {}
    if (status) {
      query.status = status
    }

    const withdrawals = await Withdrawal.find(query)
      .populate("user", "firstName lastName email university")
      .populate("processedBy", "firstName lastName")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Withdrawal.countDocuments(query)

    // Get summary stats
    const stats = await Withdrawal.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ])

    res.status(200).json({
      success: true,
      count: withdrawals.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: {
        withdrawals,
        stats,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single withdrawal request
// @route   GET /api/v1/admin/withdrawals/:id
// @access  Private (Admin only)
const getWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate("user", "firstName lastName email university earnings")
      .populate("processedBy", "firstName lastName")

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        withdrawal,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Cancel withdrawal request
// @route   PUT /api/v1/admin/withdrawals/:id/cancel
// @access  Private (Admin only)
const cancelWithdrawal = async (req, res, next) => {
  try {
    const { reason } = req.body

    const withdrawal = await Withdrawal.findById(req.params.id).populate("user")

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        error: "Withdrawal request not found",
      })
    }

    if (!["pending", "processing"].includes(withdrawal.status)) {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel withdrawal in current status",
      })
    }

    // Update withdrawal status
    withdrawal.status = "cancelled"
    withdrawal.cancellationReason = reason
    withdrawal.processedBy = req.user._id
    withdrawal.processedAt = new Date()

    // Refund user's balance
    const user = await User.findById(withdrawal.user._id)
    user.earnings.available += withdrawal.amount
    user.earnings.pending -= withdrawal.amount
    await user.save()

    await withdrawal.save()

    // Create notification
    await Notification.create({
      recipient: withdrawal.user._id,
      type: "withdrawal_processed",
      title: "Withdrawal Cancelled",
      message: `Your withdrawal request of ₦${withdrawal.amount.toLocaleString()} has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
      data: {
        withdrawalId: withdrawal._id,
        amount: withdrawal.amount,
        reason,
      },
    })

    res.status(200).json({
      success: true,
      message: "Withdrawal cancelled successfully",
      data: {
        withdrawal,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get banks list
// @route   GET /api/v1/payments/banks
// @access  Private
const getBanksList = async (req, res, next) => {
  try {
    const country = req.query.country || "NG"
    const banksResponse = await getBanks(country)

    if (banksResponse.status === "success") {
      res.status(200).json({
        success: true,
        data: {
          banks: banksResponse.data,
        },
      })
    } else {
      res.status(400).json({
        success: false,
        error: "Failed to fetch banks list",
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Resolve bank account
// @route   POST /api/v1/payments/resolve-account
// @access  Private
const resolveAccount = async (req, res, next) => {
  try {
    const { accountNumber, bankCode } = req.body

    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        success: false,
        error: "Account number and bank code are required",
      })
    }

    const accountResponse = await resolveBankAccount(accountNumber, bankCode)

    if (accountResponse.status === "success") {
      res.status(200).json({
        success: true,
        data: {
          accountName: accountResponse.data.account_name,
          accountNumber: accountResponse.data.account_number,
        },
      })
    } else {
      res.status(400).json({
        success: false,
        error: "Account resolution failed",
        details: accountResponse.message,
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Account resolution failed",
    })
  }
}

module.exports = {
  processWithdrawal,
  getWithdrawals,
  getWithdrawal,
  cancelWithdrawal,
  getBanksList,
  resolveAccount,
}
