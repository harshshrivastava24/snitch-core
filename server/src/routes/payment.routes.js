import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { createPayment, handleRazorPayWebhook, verifyPayment } from "../controllers/payment.controller.js";

const router = Router()

router.post('/create-order', authenticate, createPayment)

router.post('/verify', authenticate, verifyPayment)

router.post('/webhook', handleRazorPayWebhook)

export default router