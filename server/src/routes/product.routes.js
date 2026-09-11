import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js"
import { createProductValidator, updateProductValidator } from "../validator/product.validator.js"
import multer from "multer"
import { createProduct, deleteImage, getProducts, getProductsBySeller, toggleIsPublished, updateProduct } from "../controllers/product.controller.js";

const upload = multer({
    storage: multer.memoryStorage(),
})



const router = Router();


/**
 * @POST /api/products
 */
router.post("/", authenticate, upload.array("images", 5),
(req, res, next) => {

        console.log("req.body", req.body)
        console.log(req.body.sizes)

        if (req.body.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes)
        }

        if (req.body.categories) {
            req.body.categories = JSON.parse(req.body.categories)
        }

        if (req.body.price) {
            req.body.price = JSON.parse(req.body.price)
        }

        next()
    }, createProductValidator, createProduct)


/**
 * @PATCH /api/products/update/:id
 */
router.patch("/update/:id",
    authenticate,
    upload.array("images", 5),
    (req, res, next) => {

        console.log("req.body", req.body)
        console.log(req.body.sizes)

        if (req.body.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes)
        }

        if (req.body.categories) {
            req.body.categories = JSON.parse(req.body.categories)
        }

        if (req.body.price) {
            req.body.price = JSON.parse(req.body.price)
        }

        next()
    },
    updateProductValidator,
    updateProduct
)

/**
 * @DELETE /api/products/image/:id/:imageId
 */
router.delete("/image/:id/:imageId", authenticate, deleteImage)


/**
 * @GET "/api/products"
 */
router.get('/', getProducts)

/**
 * 
 */
router.patch("/publish/:id", authenticate, toggleIsPublished)

/**
 * @GET 
 */
router.get('/', authenticate, getProductsBySeller)

export default router;