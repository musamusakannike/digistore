export const USER_ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
} as const

export const PRODUCT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const

export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  SUCCESSFUL: "successful",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const

export const NOTIFICATION_TYPES = {
  ORDER: "order",
  PAYMENT: "payment",
  PRODUCT: "product",
  REVIEW: "review",
  SYSTEM: "system",
  PROMOTION: "promotion",
} as const

export const FILE_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ARCHIVE: ["application/zip", "application/x-rar-compressed", "application/x-7z-compressed"],
  VIDEO: ["video/mp4", "video/mpeg", "video/quicktime"],
  AUDIO: ["audio/mpeg", "audio/wav", "audio/ogg"],
} as const

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  ARCHIVE: 100 * 1024 * 1024, // 100MB
  VIDEO: 200 * 1024 * 1024, // 200MB
  AUDIO: 20 * 1024 * 1024, // 20MB
} as const

export const PLATFORM_FEE_PERCENTAGE = 0.1 // 10%
export const SELLER_PAYOUT_PERCENTAGE = 0.9 // 90%

export const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  EMAIL_VERIFICATION: "email-verification",
  PASSWORD_RESET: "password-reset",
  ORDER_CONFIRMATION: "order-confirmation",
  ORDER_COMPLETED: "order-completed",
  PRODUCT_APPROVED: "product-approved",
  PRODUCT_REJECTED: "product-rejected",
  NEW_REVIEW: "new-review",
  PAYOUT_PROCESSED: "payout-processed",
} as const

export const SOCKET_EVENTS = {
  NOTIFICATION: "notification",
  ORDER_UPDATE: "order:update",
  PRODUCT_UPDATE: "product:update",
  PAYMENT_UPDATE: "payment:update",
  NEW_MESSAGE: "message:new",
} as const
