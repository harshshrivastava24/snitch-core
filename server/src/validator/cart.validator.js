import { body, param } from 'express-validator'
import { validateRequest } from '../utils/validate'

export const addToCartValidator = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    body("size")
        .notEmpty().withMessage("Size cannot be empty")
        .isIn(["XS", "S", "M", "L", "XL", "XXL"]).withMessage("Invalid Size"),
    body("quantity")
        .notEmpty().withMessage("Minimum quantity is 1")
        .isInt({min: 1})
]

export const removeFromCartValidator = addToCartValidator