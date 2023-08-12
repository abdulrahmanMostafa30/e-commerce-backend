import express from 'express';

const router = express.Router();
import * as  authController from '../controllers/authController';
import * as  userController from '../controllers/userController';

import { convertUrlToImage, extractFile } from '../middleware/file';


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API operations for user authentication
 */

/**
 * @swagger
 * /api/users/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profileImage:
 *                 type: file
 *     responses:
 *       201:
 *         description: User successfully signed up
 */

router.post("/signup", convertUrlToImage, extractFile, authController.signup);

/**
 * @swagger
 * /api/users/auth/login:
 *   post:
 *     summary: Log in as a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in with JWT token
 */

router.post("/login", authController.login);



router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);
router.get(
  "/generate-verification-code",
  authController.generate_verification_code
);
router.post("/check-verification-code", authController.check_verification_code);
router.use(authController.protectEmailVerified);
router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/updateMe", extractFile, userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);


export default router;
