const User = require("../models/User")
const File = require("../models/File")
const Transaction = require("../models/Transaction")
const Commission = require("../models/Commission")

// @desc    Get platform analytics
// @route   GET /api/v1/analytics/platform
// @access  Private (Admin only)
const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query

    // Calculate date range
    const now = new Date()
    let startDate
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get basic counts
    const totalUsers = await User.countDocuments()
    const totalFiles = await File.countDocuments()
    const totalTransactions = await Transaction.countDocuments({ status: "completed" })

    // Get period-specific data
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    })

    const newFiles = await File.countDocuments({
      createdAt: { $gte: startDate },
    })

    const periodTransactions = await Transaction.countDocuments({
      status: "completed",
      createdAt: { $gte: startDate },
    })

    // Revenue analytics
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const periodRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    // Commission analytics
    const totalCommissions = await Commission.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])

    // Top selling files
    const topFiles = await Transaction.aggregate([
      { $match: { status: "completed" } },
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
          as: "fileInfo",
        },
      },
      { $unwind: "$fileInfo" },
      {
        $project: {
          title: "$fileInfo.title",
          sales: 1,
          revenue: 1,
        },
      },
    ])

    // Top sellers
    const topSellers = await Transaction.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "files",
          localField: "file",
          foreignField: "_id",
          as: "fileInfo",
        },
      },
      { $unwind: "$fileInfo" },
      {
        $group: {
          _id: "$fileInfo.seller",
          sales: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      { $unwind: "$sellerInfo" },
      {
        $project: {
          name: {
            $concat: ["$sellerInfo.firstName", " ", "$sellerInfo.lastName"],
          },
          sales: 1,
          revenue: 1,
        },
      },
    ])

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalFiles,
          totalTransactions,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalCommissions: totalCommissions[0]?.total || 0,
        },
        period: {
          newUsers,
          newFiles,
          periodTransactions,
          periodRevenue: periodRevenue[0]?.total || 0,
        },
        topFiles,
        topSellers,
      },
    })
  } catch (error) {
    console.error("Get platform analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get seller analytics
// @route   GET /api/v1/analytics/seller
// @access  Private
const getSellerAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query

    // Calculate date range
    const now = new Date()
    let startDate
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get seller's files
    const sellerFiles = await File.find({ seller: req.user.id })
    const fileIds = sellerFiles.map((file) => file._id)

    // Total sales and revenue
    const totalSales = await Transaction.countDocuments({
      file: { $in: fileIds },
      status: "completed",
    })

    const totalRevenue = await Transaction.aggregate([
      {
        $match: {
          file: { $in: fileIds },
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$sellerAmount" } } },
    ])

    // Period sales and revenue
    const periodSales = await Transaction.countDocuments({
      file: { $in: fileIds },
      status: "completed",
      createdAt: { $gte: startDate },
    })

    const periodRevenue = await Transaction.aggregate([
      {
        $match: {
          file: { $in: fileIds },
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$sellerAmount" } } },
    ])

    // File performance
    const filePerformance = await Transaction.aggregate([
      {
        $match: {
          file: { $in: fileIds },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$file",
          sales: { $sum: 1 },
          revenue: { $sum: "$sellerAmount" },
        },
      },
      { $sort: { sales: -1 } },
      {
        $lookup: {
          from: "files",
          localField: "_id",
          foreignField: "_id",
          as: "fileInfo",
        },
      },
      { $unwind: "$fileInfo" },
      {
        $project: {
          title: "$fileInfo.title",
          sales: 1,
          revenue: 1,
        },
      },
    ])

    res.json({
      success: true,
      data: {
        overview: {
          totalFiles: sellerFiles.length,
          totalSales,
          totalRevenue: totalRevenue[0]?.total || 0,
          averagePrice: totalSales > 0 ? (totalRevenue[0]?.total || 0) / totalSales : 0,
        },
        period: {
          periodSales,
          periodRevenue: periodRevenue[0]?.total || 0,
        },
        filePerformance,
      },
    })
  } catch (error) {
    console.error("Get seller analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getPlatformAnalytics,
  getSellerAnalytics,
}
