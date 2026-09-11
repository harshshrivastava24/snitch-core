import { Router } from 'express'
import authenticate from '../middlewares/auth.middleware.js'
import { addToCartValidator, removeFromCartValidator } from '../validator/cart.validator.js'
import { addProductToCart, getCart, removeProductFromCart } from '../controllers/cart.controller.js'

const router = Router()

router.use(authenticate)

/**
 * @POST /api/cart/add/products/:id
 */

router.post('/add/product/:productId', addToCartValidator, addProductToCart)

/**
 * @DELETE /api/cart/remove/product/:productId
 */
router.delete('/remove/product/:productId', removeFromCartValidator, removeProductFromCart)

/**
 * @GET /api/cart
 */
router.get('/', getCart)
export default router