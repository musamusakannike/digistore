import type { Request, Response } from "express";
import Notification from "../models/notification.model";
import { asyncHandler } from "../utils/asynchandler.util";
import { sendSuccess, sendError } from "../utils/response.util";

// Get user notifications
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const userId = req.user?._id;

    const query: any = { user: userId };

    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === "true";

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("relatedId");

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
    return sendSuccess(res, 200, "Notifications retrieved successfully", {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      unreadCount,
    });
  }
);

// Get unread count
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return sendSuccess(res, 200, "Unread count retrieved successfully", {
      unreadCount,
    })
  }
);

// Mark notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;

  const notification = await Notification.findOne({ _id: id, user: userId });

  if (!notification) {
    return sendError(res, 404, "Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  return sendSuccess(res, 200, "Notification marked as read", notification);
});

// Mark all as read
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, 200, "All notifications marked as read");
  }
);

// Delete notification
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    return sendSuccess(res, 200, "Notification deleted successfully");
  }
);

// Delete all read notifications
export const deleteAllRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    await Notification.deleteMany({ user: userId, isRead: true });

    return sendSuccess(res, 200, "All read notifications deleted successfully");
  }
);

// Delete all notifications
export const deleteAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    await Notification.deleteMany({ user: userId });

    return sendSuccess(res, 200, "All notifications deleted successfully");
  }
);

// Create notification (internal use)
export const createNotification = async (data: {
  user: string;
  title: string;
  message: string;
  type: "order" | "payment" | "product" | "review" | "system" | "promotion";
  relatedId?: string;
  relatedModel?: "Order" | "Product" | "Transaction" | "Review";
  priority?: "low" | "medium" | "high";
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}) => {
  return await Notification.create(data);
};
