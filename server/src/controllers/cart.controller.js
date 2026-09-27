import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

export const addProductToCart = async (req, res) => {

    const { productId } = req.params
    const { size: productSize, quantity } = req.body

    const product = await productModel.findById(productId)

    if (!product) return res.status(404).json({ message: "Product not Found" })

    const size = product.sizes.find(s => s.size === productSize)

    if (!size) return res.status(400).json({ message: "Invalid size" })

    if (quantity > size.stock) {
        return res.status(400).json({
            message: ""
        })
    }

    // const isCartExists = await cartModel.exists({ user: req.user.id })

    // await cartModel.findOneAndUpdate(
    //     {
    //         user: req.user.id
    //     }, {
    //         $push: {
    //             products: {
    //                 product: productId,
    //                 size: productSize,
    //                 quantity: quantity
    //             }
    //         }
    //     }, {
    //         upsert: true
    //     }
    // )

    const cart = (await cartModel.findOne({ user: req.user.id })) ?? await cartModel.create({ user: req.user.id })

    const productInCart = cart.products.find(p => p.product.toString() === productId && p.size === productSize)

    if (productInCart) {
        const totalQuantity = productInCart.quantity + quantity;

        if (totalQuantity > size.stock) {
            return res.status(400).json({
                message: `Insufficient stock. Available: ${size.stock}`
            })
        }

        await cartModel.findOneAndUpdate(
            { user: req.user.id },
            {
                $set: {
                    "products.$[elem].quantity": totalQuantity
                }
            },
            {
                arrayFilters: [{ "elem.product": productId, "elem.size": productSize }]
            }
        )
    } else {
        await cartModel.findOneAndUpdate({
            user: req.user.id
        }, {
            $push: {
                products: {
                    product: productId,
                    size: productSize,
                    quantity: quantity
                }
            }
        })
    }

    res.status(200).json({ message: "Product added"})
}

export const removeProductFromCart = async (req, res) => {
    const {productId} = req.params
    const { size: productSize, quantity } = req.body

    const product = await productModel.findById(productId)

    if(!product) {
        return res.status(404).json({ message: "Product not found" })
    }

    const cart = await cartModel.findOne({ user: req.user.id})

    if(!cart) {
        return res.status(404).json({ message: "Cart not found" })
    }

    const productInCart = cart.products.find(p => {
        return p.product.toString() === productId && p.size === productSize
    })
    
    if(!productInCart) {
        return res.status(404).json({ message: "Product not found" })
    }

    if(productInCart.quantity <= quantity) {
        await cartModel.findOneAndUpdate(
            { user: req.user.id },
            {
                $pull: {
                    products: {
                        product: productId,
                        size: productSize
                    }
                }
            }
        )
    } else {
        const newQuantity = productInCart.quantity - quantity

        await cartModel.findOneAndUpdate(
            { user: req.user.id },
            {
                $set: {
                    "products.$[elem].quantity": newQuantity
                }
            },
            {
                arrayFilters: [ { "elem.product": productId, "elem.size": productSize}]
            }
        )
    }

    return res.status(200).json({
        message: "Product removed from cart"
    })
}

export const getCart = async (req, res) => {
    const user = req.user

    const cart = (await cartModel.findOne({user: user.id}).populate("products.product")) || await cartModel.create({user: user.id})

    const totalPrice = cart.products.reduce((total, item) => {
        return total + (item.product.price.amount * item.quantity)
    }, 0)

    res.status(200).json({
        message: "Cart fetched",
        cart: cart,
        totalPrice: totalPrice
    })
}