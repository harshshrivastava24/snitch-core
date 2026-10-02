import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    email: {
        type: String,
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        maxLength: 100
    },
    passwordHash: {
        type: String,
        required: false,
        select: false
    },
    role: {
        type: String,
        required: true,
        default: "user",
        enum: ["user", "seller"]
    }
})

const userModel = mongoose.model("user", userSchema)
export default userModel