import { Router } from "express"
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from "../controllers/notification.controller"
import { protect } from "../middlewares/auth.middleware"

const router = Router()

router.use(protect)

router.get("/", getNotifications)
router.get("/unread-count", getUnreadCount)
router.put("/:id/read", markAsRead)
router.put("/read-all", markAllAsRead)
router.delete("/:id", deleteNotification)
router.delete("/read/all", deleteAllRead)

export default router
