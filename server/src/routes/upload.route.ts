import { Router } from "express"
import {
  uploadThumbnail,
  uploadImages,
  deleteImage,
  uploadProductFiles,
  deleteProductFile,
  downloadProductFile,
} from "../controllers/upload.controller"
import { protect, authorize, verifyEmail } from "../middlewares/auth.middleware"
import { uploadImage, uploadProductFile, handleMulterError } from "../middlewares/upload.middleware"

const router = Router()

// All routes are protected
router.use(protect)

// Thumbnail upload
router.post(
  "/:id/thumbnail",
  authorize("seller", "admin"),
  verifyEmail,
  uploadImage.single("thumbnail"),
  handleMulterError,
  uploadThumbnail,
)

// Images upload
router.post(
  "/:id/images",
  authorize("seller", "admin"),
  verifyEmail,
  uploadImage.array("images", 5),
  handleMulterError,
  uploadImages,
)

router.delete("/:id/images", authorize("seller", "admin"), verifyEmail, deleteImage)

// Product files upload
router.post(
  "/:id/files",
  authorize("seller", "admin"),
  verifyEmail,
  uploadProductFile.array("files", 10),
  handleMulterError,
  uploadProductFiles,
)

router.delete("/:id/files/:fileId", authorize("seller", "admin"), verifyEmail, deleteProductFile)

// Download product file
router.get("/:id/download/:fileId", downloadProductFile)

export default router
