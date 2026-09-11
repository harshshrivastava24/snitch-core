import { body } from 'express-validator'
import { validateRequest } from '../utils/validate.js'

export const registerValidator = [
    body('name')
    .notEmpty().withMessage("Name is required")
    .isLength({min: 3}).withMessage("Name must be atleast 3 characters"),
    body('email')
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email is not valid"),
    body('password')
    .notEmpty().withMessage("Password is required")
    .isLength({min: 6}).withMessage("Password must be of min length 6"),

    validateRequest
]

export const loginValidator = [
    body('email')
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Email not Valid"),
    body('password')
    .notEmpty().withMessage("Password is required"),

    validateRequest
]