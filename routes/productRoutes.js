import express from 'express';

const router = express.Router();
import * as productController from '../controllers/productController';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API operations for products
 * 
 */

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successful response with the list of products
 */

router.get("/", productController.getAllProducts);

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Successful response with the product details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get("/:id", productController.getProductById);

export default router;
