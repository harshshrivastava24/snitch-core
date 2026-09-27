import Razorpay from 'razorpay'

const keyId = process.env.RAZORPAY_KEY_ID
const keySecret = process.env.RAZORPAY_KEY_SECRET

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
})

export default razorpay