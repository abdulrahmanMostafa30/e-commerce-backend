import express from 'express';
import { removeFromCart, getUserCart } from '../../controllers/adminControllers/cartAdminController';
import { restrictTo } from '../../controllers/authController';

const router = express.Router();

// Middleware to restrict routes to superAdmin and orderAdmin roles
router.use(restrictTo('superAdmin', 'orderAdmin'));

// Remove product from cart (for admin)
router.delete('/:userId/:productId', removeFromCart);

// Get cart for a user (for admin)
router.get('/:userId', getUserCart);

// Add more cart-related routes as needed

export default router;
