import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from "./src/models/product.model.js";

dotenv.config();

const sellerId = "6ab6aa1d0d615442c897af16";

const products = [
    {
        title: "Classic Cotton T-Shirt",
        description: "Comfortable cotton t-shirt made for everyday casual wear.",
        price: {
            amount: 799,
            currency: "INR"
        },
        categories: ["T-Shirts", "Men", "Casual"],
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
        ],
        seller: sellerId,
        sizes: [
            { size: "S", stock: 15 },
            { size: "M", stock: 25 },
            { size: "L", stock: 20 },
            { size: "XL", stock: 10 }
        ],
        isPublished: true
    },

    {
        title: "Slim Fit Denim Jeans",
        description: "Classic slim fit denim jeans suitable for casual everyday outfits.",
        price: {
            amount: 1899,
            currency: "INR"
        },
        categories: ["Jeans", "Men", "Denim"],
        images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d"
        ],
        seller: sellerId,
        sizes: [
            { size: "S", stock: 8 },
            { size: "M", stock: 18 },
            { size: "L", stock: 22 },
            { size: "XL", stock: 12 }
        ],
        isPublished: true
    },

    {
        title: "Oversized Hoodie",
        description: "Soft and comfortable oversized hoodie designed for a relaxed fit.",
        price: {
            amount: 1499,
            currency: "INR"
        },
        categories: ["Hoodies", "Men", "Winter"],
        images: [
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7"
        ],
        seller: sellerId,
        sizes: [
            { size: "M", stock: 15 },
            { size: "L", stock: 20 },
            { size: "XL", stock: 14 },
            { size: "XXL", stock: 8 }
        ],
        isPublished: true
    },

    {
        title: "Women's Casual Jacket",
        description: "Lightweight casual jacket that works well for everyday outfits.",
        price: {
            amount: 2299,
            currency: "INR"
        },
        categories: ["Jackets", "Women", "Casual"],
        images: [
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a"
        ],
        seller: sellerId,
        sizes: [
            { size: "S", stock: 12 },
            { size: "M", stock: 20 },
            { size: "L", stock: 15 },
            { size: "XL", stock: 7 }
        ],
        isPublished: true
    },

    {
        title: "Basic White Shirt",
        description: "Simple white shirt suitable for office, formal and casual occasions.",
        price: {
            amount: 1299,
            currency: "INR"
        },
        categories: ["Shirts", "Men", "Formal"],
        images: [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"
        ],
        seller: sellerId,
        sizes: [
            { size: "S", stock: 10 },
            { size: "M", stock: 20 },
            { size: "L", stock: 18 },
            { size: "XL", stock: 10 }
        ],
        isPublished: true
    },

    {
        title: "Running Sports Shoes",
        description: "Lightweight running shoes designed for workouts and daily activities.",
        price: {
            amount: 2499,
            currency: "INR"
        },
        categories: ["Shoes", "Sports", "Running"],
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
        ],
        seller: sellerId,
        sizes: [
            { size: "S", stock: 5 },
            { size: "M", stock: 12 },
            { size: "L", stock: 15 },
            { size: "XL", stock: 8 }
        ],
        isPublished: true
    },

    {
        title: "Women's Summer Dress",
        description: "Lightweight summer dress with a comfortable fit for warm weather.",
        price: {
            amount: 1799,
            currency: "INR"
        },
        categories: ["Dresses", "Women", "Summer"],
        images: [
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446"
        ],
        seller: sellerId,
        sizes: [
            { size: "XS", stock: 8 },
            { size: "S", stock: 15 },
            { size: "M", stock: 18 },
            { size: "L", stock: 12 }
        ],
        isPublished: true
    },

    {
        title: "Classic Polo T-Shirt",
        description: "Classic polo t-shirt made from comfortable breathable fabric.",
        price: {
            amount: 999,
            currency: "INR"
        },
        categories: ["T-Shirts", "Men", "Polo"],
        images: [
            "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d"
        ],
        seller: sellerId,
        sizes: [
            { size: "S", stock: 10 },
            { size: "M", stock: 22 },
            { size: "L", stock: 20 },
            { size: "XL", stock: 12 }
        ],
        isPublished: true
    },

    {
        title: "Leather Wallet",
        description: "Compact leather wallet with multiple card and cash compartments.",
        price: {
            amount: 899,
            currency: "INR"
        },
        categories: ["Accessories", "Wallets", "Men"],
        images: [
            "https://images.unsplash.com/photo-1627123424574-724758594e93"
        ],
        seller: sellerId,
        sizes: [
            { size: "S", stock: 30 }
        ],
        isPublished: true
    },

    {
        title: "Winter Puffer Jacket",
        description: "Warm padded puffer jacket designed for cold winter weather.",
        price: {
            amount: 3299,
            currency: "INR"
        },
        categories: ["Jackets", "Winter", "Men"],
        images: [
            "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f"
        ],
        seller: sellerId,
        sizes: [
            { size: "M", stock: 10 },
            { size: "L", stock: 15 },
            { size: "XL", stock: 12 },
            { size: "XXL", stock: 6 }
        ],
        isPublished: true
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        await productModel.deleteMany({});

        await productModel.insertMany(products);

        console.log(`${products.length} products inserted successfully`);

        await mongoose.connection.close();

        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Error while seeding products:", error);
        process.exit(1);
    }
};

seedProducts();