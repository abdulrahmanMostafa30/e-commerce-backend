import express from 'express';
const router = express.Router();
import * as  authController from "../../controllers/authController";
import * as  categoryAdminController from "../../controllers/adminControllers/categoryAdminController";


router.use(authController.restrictTo("superAdmin", "productAdmin")); // Only superAdmin and productAdmin can access

router.post("/", categoryAdminController.createCategory);
router.patch("/:id", categoryAdminController.updateCategory);
router.delete("/:id", categoryAdminController.deleteCategory);

export default router;