import express from 'express';

const router = express.Router();
import * as  authController from '../controllers/authController';
import * as  cartController from '../controllers/cartController';

router.use(authController.protect);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API operations for the cart
 * 
 * securitySchemes:
 *   BearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: [] 
 *     responses:
 *       200:
 *         description: Successful response with the user's cart
 *       401:
 *         description: Unauthorized
 */

router.get("/", cartController.getCart);

/**
 * @swagger
 * /api/cart:
 *   patch:
 *     summary: Update the user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object  // No schema reference
 *     responses:
 *       200:
 *         description: Successful response with the updated cart
 *       401:
 *         description: Unauthorized
 */
router.patch("/", cartController.updateCart);

export default router;
