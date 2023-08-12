import express from 'express';
const router = express.Router();
import * as  authController from '../../controllers/authController';
import * as  orderAdminController from '../../controllers/adminControllers/orderAdminController';


router.use(authController.restrictTo('superAdmin', 'orderAdmin'));

router.get('/', orderAdminController.getAllOrders);
router.put('/:id', orderAdminController.updateOrderStatus);

// Add more routes for order management by order admin

export default router;