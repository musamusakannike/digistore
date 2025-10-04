import { Router } from "express"
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  becomeSeller,
  updateBankDetails,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  updatePushToken,
} from "../controllers/user.controller"
import { protect } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"
import {
  updateProfileValidator,
  changePasswordValidator,
  becomeSellerValidator,
  updateBankDetailsValidator,
} from "../validators/user.validator"

const router = Router()

// All routes are protected
router.use(protect)

router.get("/profile", getProfile)
router.put("/profile", updateProfileValidator, validate, updateProfile)
router.post("/avatar", uploadAvatar)
router.put("/password", changePasswordValidator, validate, changePassword)
router.post("/become-seller", becomeSellerValidator, validate, becomeSeller)
router.put("/bank-details", updateBankDetailsValidator, validate, updateBankDetails)
router.post("/wishlist/:productId", addToWishlist)
router.delete("/wishlist/:productId", removeFromWishlist)
router.get("/wishlist", getWishlist)
router.post("/push-token", updatePushToken)

export default router
