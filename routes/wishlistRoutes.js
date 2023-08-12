import express from 'express';

const router = express.Router();
import * as  authController from '../controllers/authController';
import * as  wishlistController from '../controllers/wishlistController';

router.use(authController.protect);

router.route("/").get(wishlistController.getWishlist);
router.route("/:productId").post(wishlistController.addToWishlist);
router.route("/:productId").delete(wishlistController.removeFromWishlist);

export default router;
