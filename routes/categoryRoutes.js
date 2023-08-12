/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories
 */

import express from 'express';

import * as categoryController from '../controllers/categoryController';

const router = express.Router();

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object  // No schema reference
 */

router.route("/").get(categoryController.getCategories);

export default router;
