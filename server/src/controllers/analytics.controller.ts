import type { Request, Response, NextFunction } from "express"
import Order from "../models/order.model"
import { asyncHandler } from "../utils/asynchandler.util"
import { sendSuccess } from "../utils/response.util"

// @desc    Get seller analytics
// @route   GET /api/v1/analytics/seller
// @access  Private (Seller)
export const getSellerAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { period = "30d" } = req.query

  let dateFilter: Date
  switch (period) {
    case "7d":
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      break
    case "30d":
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      break
    case "90d":
      dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      break
    case "1y":
      dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }

  // Sales over time
  const salesOverTime = await Order.aggregate([
    {
      $match: {
        "items.seller": req.user?._id,
        paymentStatus: "paid",
        createdAt: { $gte: dateFilter },
      },
    },
    { $unwind: "$items" },
    { $match: { "items.seller": req.user?._id } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        sales: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Top products
  const topProducts = await Order.aggregate([
    {
      $match: {
        "items.seller": req.user?._id,
        paymentStatus: "paid",
        createdAt: { $gte: dateFilter },
      },
    },
    { $unwind: "$items" },
    { $match: { "items.seller": req.user?._id } },
    {
      $group: {
        _id: "$items.product",
        title: { $first: "$items.title" },
        sales: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ])

  // Total stats
  const totalStats = await Order.aggregate([
    {
      $match: {
        "items.seller": req.user?._id,
        paymentStatus: "paid",
        createdAt: { $gte: dateFilter },
      },
    },
    { $unwind: "$items" },
    { $match: { "items.seller": req.user?._id } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        orderCount: { $sum: 1 },
      },
    },
  ])

  const stats = totalStats.length > 0 ? totalStats[0] : { totalSales: 0, totalRevenue: 0, orderCount: 0 }

  sendSuccess(res, 200, "Analytics retrieved successfully", {
    salesOverTime,
    topProducts,
    stats,
  })
})

// @desc    Get buyer analytics
// @route   GET /api/v1/analytics/buyer
// @access  Private
export const getBuyerAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const totalOrders = await Order.countDocuments({ buyer: req.user?._id })
  const completedOrders = await Order.countDocuments({ buyer: req.user?._id, status: "completed" })

  const spendingStats = await Order.aggregate([
    { $match: { buyer: req.user?._id, paymentStatus: "paid" } },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$totalAmount" },
      },
    },
  ])

  const totalSpent = spendingStats.length > 0 ? spendingStats[0].totalSpent : 0

  // Recent purchases
  const recentPurchases = await Order.find({ buyer: req.user?._id, paymentStatus: "paid" })
    .populate("items.product", "title thumbnail")
    .sort({ createdAt: -1 })
    .limit(5)

  sendSuccess(res, 200, "Analytics retrieved successfully", {
    totalOrders,
    completedOrders,
    totalSpent,
    recentPurchases,
  })
})
