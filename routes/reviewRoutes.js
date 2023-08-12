import express from 'express';

const router = express.Router();
import * as  authController from '../controllers/authController';
import * as  reviewController from '../controllers/reviewController';

router.get("/", authController.protect, reviewController.getReviews);

router.post("/", authController.protect, reviewController.createReview);
router.get("/:productId", reviewController.getReviewsProduct);
router.delete("/:id", authController.protect, reviewController.deleteReview);

export default router;
