import {Router} from 'express'
import authenticate from '../middlewares/auth.middleware.js'
import { getMe, login, register } from '../controllers/auth.controller.js'
import { loginValidator, registerValidator } from '../validator/auth.validator.js'

const router = Router()

router.post('/register', registerValidator, register)
router.post("/login", loginValidator, login)


router.get("/me", authenticate, getMe)

export default router