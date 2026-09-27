import razorpay from "../config/razorpay.config.js"
import cartModel from "../models/cart.model.js"
import orderModel from "../models/order.model.js"
import paymentModel from "../models/payment.model.js"
import productModel from "../models/product.model.js"
import crypto from "crypto"
import Razorpay from "razorpay"

export const createPayment = async (req, res) => {
    const user = req.user
    const { address } = req.body

    const cart = await cartModel.findOne({ user: user.id }).populate("products.product")

    if (!cart || cart.products.length === 0) {
        return res.status(404).json({ message: "Cart is empty" })
    }

    const totalAmount = cart.products.reduce((total, item) => {
        return total + (item.product.price.amount * item.quantity)
    }, 0)

    const order = await orderModel.create({
        user: user.id,
        address: address,
        products: cart.products.map(product => {
            const rawImage = product.product.images?.[0]
            const imageUrl = typeof rawImage === 'string'
                ? rawImage
                : (rawImage?.url ?? "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab")
            return {
                product: {
                    title: product.product.title,
                    description: product.product.description,
                    price: product.product.price,
                    image: imageUrl,
                    productId: product.product._id
                },
                quantity: product.quantity,
                size: product.size
            }
        }),
        totalPrice: {
            amount: totalAmount,
            currency: "INR"
        },
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        status: "PLACED"
    })


    const amountinPaise = Math.round(totalAmount * 100)

    const razorpayOrder = await razorpay.orders.create({
        amount: amountinPaise,
        currency: "INR",
        receipt: order._id.toString()
    })

    await paymentModel.create({
        order: order._id,
        user: user.id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        status: "PENDING",
    })

    return res.status(201).json({
        message: "Payment order created",
        data: {
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        }
    })
}

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
        await paymentModel.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { status: "FAILED" }
        )

        return res.status(400).json({ success: false, message: "Payment verification failed" })
    }

    const payment = await paymentModel.findOne({ razorpayOrderId: razorpay_order_id })

    if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" })
    }

    payment.status = "COMPLETED"
    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature

    await payment.save()

    const order = await orderModel.findByIdAndUpdate(payment.order,
        {
            paymentStatus: "COMPLETED",
            status: "CONFIRMED"
        }, { new: true }
    )

    await productModel.bulkWrite(
        order.products.map(item => ({
            updateOne: {
                filter: {
                    _id: item.product.productId,
                    "sizes.size": item.size
                },
                update: {
                    $inc: { "sizes.$.stock": -item.quantity }
                }
            }
        }))
    )

    await cartModel.findOneAndUpdate(
        { user: req.user.id },
        { $set: { products: [] } }
    )

    return res.status(200).json({ success: true, message: "Payment verified successfully", orderId: order._id })
}

export const handleRazorPayWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"]

    const isValid = Razorpay.validateWebhookSignature(
        JSON.stringify(req.body),
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET
    )

    if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid webhook signature" })
    }

    const event = req.body.event

    if (event === "payment.captured" || event === "order.paid") {
        const paymentEntity = req.body.payload.payment?.entity
        const razorpayOrderId = paymentEntity?.order_id

        const payment = await paymentModel.findOne({ razorpayOrderId })

        if (payment) {
            if (payment.status === "COMPLETED") {
                return res.status(200).json({ success: true, message: "Order already processed" })
            }

            payment.status = "COMPLETED"
            payment.razorpayPaymentId = paymentEntity?.id
            payment.razorpaySignature = signature
            await payment.save()

            const order = await orderModel.findByIdAndUpdate(
                payment.order,
                {
                    paymentStatus: "COMPLETED",
                    status: "CONFIRMED"
                },
                { new: true }
            )

            await productModel.bulkWrite(
                order.products.map(item => ({
                    updateOne: {
                        filter: {
                            _id: item.product.productId,
                            "sizes.size": item.size
                        },
                        update: {
                            $inc: { "sizes.$.stock": -item.quantity }
                        }
                    }
                }))
            )

            await cartModel.findOneAndUpdate(
                { user: order.user },
                { $set: { products: [] } }
            )

            return res.status(200).json({ success: true, message: "Payment verified successfully", orderId: order._id })
        }
    }

    return res.status(200).json({ success: true, message: "Webhook processed successfully" })
}
