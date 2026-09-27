import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true, // One Razorpay order per transaction
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
        amount: {
            type: Number,
            required: true, // in paise or base amount
        },
        currency: {
            type: String,
            default: "INR",
        },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
        paymentMethod: {
            type: String,
            default: "RAZORPAY",
        },
    },
    { timestamps: true }
);

const paymentModel = mongoose.model("Payment", paymentSchema);
export default paymentModel;
