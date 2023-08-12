import express from 'express';
const router = express.Router();
import * as  authController from '../../controllers/authController';
import * as  reviewAdminController from '../../controllers/adminControllers/reviewAdminController';

router.use(authController.restrictTo("superAdmin", "customerServiceAdmin"));
router.delete("/:reviewId", reviewAdminController.deleteReview);
router.put("/:reviewId", reviewAdminController.updateReview); // Updated route name

export default router;
