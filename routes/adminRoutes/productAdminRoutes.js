import express from 'express';
const router = express.Router();
import * as  authController from '../../controllers/authController';
import * as  productAdminController from '../../controllers/adminControllers/productAdminController';
import { extractFile } from '../../middleware/file';



router.use(authController.restrictTo("superAdmin", "productAdmin"));
router.post("/", extractFile, productAdminController.createProduct);
router.put("/:id", extractFile, productAdminController.updateProduct);
router.delete("/:id", productAdminController.deleteProduct);

// Add more routes for product-related admin functionalities as needed

export default router;
