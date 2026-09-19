import bcrypt from "bcryptjs"
import userModel from "../models/user.model.js"
import type { Request, Response } from "express"

export const register = async (req: Request, res: Response) => {
    const { name, email, password, role} = req.body

    const user = await userModel.findOne({email})

    if(user) return res.status(409).json({
        success: false,
        message: "User already exists"
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await userModel.create({
        name,
        email,
        passwordHash: hashedPassword,
        role
    })

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser
    })
}