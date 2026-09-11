import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
        maxLength: 100
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type:String,
        required: true,
        default: 'user',
        enum: ['user', 'seller']
    }
})

const userModel = mongoose.model('user', userSchema)

export default userModel