import express from 'express';
const router = express.Router();
import * as  authController from '../../controllers/authController';
import * as  usersAdminController from '../../controllers/adminControllers/userAdminController';


router.use(authController.restrictTo("superAdmin", "customerServiceAdmin"));

// Routes for managing users by admin
router.get("/", usersAdminController.getAllUsers);
router.get("/:id", usersAdminController.getUserById);
router.patch("/:id", usersAdminController.updateUser);
router.delete("/:id", usersAdminController.deleteUser);

// Add more routes for user-related admin functionalities as needed

export default router;
