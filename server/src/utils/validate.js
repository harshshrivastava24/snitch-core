import { validationResult } from "express-validator"


export const validateRequest = (req, res, next) => {
        const error = validationResult(req)

        if(!error.isEmpty()) {
            return res.status(400).json({
                message: "Validation errors",
                errors: error.array()
            })
        }

        next()
    }