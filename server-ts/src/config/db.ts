import mongoose from 'mongoose'

const connectDb = async () => {
    await mongoose.connect("")
    
    console.log("Connected to DB")
}

export default connectDb