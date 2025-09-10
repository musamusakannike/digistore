const User = require("../models/User")
const File = require("../models/File")
const Transaction = require("../models/Transaction")
const Withdrawal = require("../models/Withdrawal")
const { validationResult } = require("express-validator")

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("filesUploaded", "title price status downloads averageRating")
      .populate("filesPurchased", "title price createdAt")

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user earnings
// @route   GET /api/v1/users/earnings
// @access  Private
const getEarnings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    // Get detailed earnings breakdown
    const transactions = await Transaction.find({
      seller: req.user._id,
      status: "successful",
    })
      .populate("file", "title")
      .populate("buyer", "firstName lastName")
      .sort({ createdAt: -1 })

    // Get pending withdrawals
    const pendingWithdrawals = await Withdrawal.find({
      user: req.user._id,
      status: { $in: ["pending", "processing"] },
    }).sort({ createdAt: -1 })

    // Calculate monthly earnings
    const monthlyEarnings = await Transaction.aggregate([
      {
        $match: {
          seller: req.user._id,
          status: "successful",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalEarnings: { $sum: "$sellerEarning" },
          totalSales: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        earnings: user.earnings,
        transactions,
        pendingWithdrawals,
        monthlyEarnings,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Request withdrawal
// @route   POST /api/v1/users/withdraw
// @access  Private
const requestWithdrawal = async (req, res, next) => {
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

    const { amount } = req.body
    const user = await User.findById(req.user._id)

    // Check if user has bank details
    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      return res.status(400).json({
        success: false,
        error: "Please update your bank details before requesting withdrawal",
      })
    }

    // Check if user has sufficient balance
    if (user.earnings.available < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance for withdrawal",
      })
    }

    // Check minimum withdrawal amount
    const minWithdrawal = Number.parseInt(process.env.MINIMUM_WITHDRAWAL_AMOUNT) || 5000
    if (amount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        error: `Minimum withdrawal amount is ₦${minWithdrawal.toLocaleString()}`,
      })
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount,
      bankDetails: user.bankDetails,
      metadata: {
        userAgent: req.get("User-Agent"),
        ipAddress: req.ip,
      },
    })

    // Update user earnings
    user.earnings.available -= amount
    user.earnings.pending += amount
    await user.save()

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: {
        withdrawal,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user's files
// @route   GET /api/v1/users/files
// @access  Private
const getUserFiles = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const status = req.query.status
    const sort = req.query.sort || "-createdAt"

    // Build query
    const query = { seller: req.user._id }
    if (status) {
      query.status = status
    }

    const files = await File.find(query)
      .populate("category", "name")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await File.countDocuments(query)

    res.status(200).json({
      success: true,
      count: files.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: {
        files,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user's purchases
// @route   GET /api/v1/users/purchases
// @access  Private
const getUserPurchases = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10

    const purchases = await Transaction.find({
      buyer: req.user._id,
      status: "successful",
    })
      .populate("file", "title description thumbnail price")
      .populate("seller", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Transaction.countDocuments({
      buyer: req.user._id,
      status: "successful",
    })

    res.status(200).json({
      success: true,
      count: purchases.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: {
        purchases,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user dashboard stats
// @route   GET /api/v1/users/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)

    // Get file stats
    const fileStats = await File.aggregate([
      { $match: { seller: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate("file", "title")
      .populate("buyer seller", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get monthly stats
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          seller: req.user._id,
          status: "successful",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$sellerEarning" },
          totalSales: { $sum: 1 },
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        user: {
          earnings: user.earnings,
          filesUploaded: await File.countDocuments({ seller: req.user._id }),
          filesPurchased: await Transaction.countDocuments({ buyer: req.user._id, status: "successful" }),
        },
        fileStats,
        recentTransactions,
        monthlyStats: monthlyStats[0] || { totalEarnings: 0, totalSales: 0 },
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getProfile,
  getEarnings,
  requestWithdrawal,
  getUserFiles,
  getUserPurchases,
  getDashboardStats,
}
