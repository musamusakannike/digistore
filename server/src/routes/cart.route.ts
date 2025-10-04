import { Router } from "express"
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller"
import { protect } from "../middlewares/auth.middleware"
import { validate } from "../middlewares/validate.middleware"
import { addToCartValidator, updateCartItemValidator } from "../validators/cart.validator"

const router = Router()

// All routes are protected
router.use(protect)

router.get("/", getCart)
router.post("/items", addToCartValidator, validate, addToCart)
router.put("/items/:productId", updateCartItemValidator, validate, updateCartItem)
router.delete("/items/:productId", removeFromCart)
router.delete("/", clearCart)

export default router
