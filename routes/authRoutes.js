import express from 'express';

const router = express.Router();
import * as  authController from '../controllers/authController';

router.post('/refresh-access-token', authController.generateNewAccessToken);
export default router;