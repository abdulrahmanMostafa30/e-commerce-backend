import express from "express";
const router = express.Router();
import * as authController from "../controllers/authController";

import cartAdminRoutes from "./adminRoutes/cartAdminRoutes";
import orderAdminRoutes from "./adminRoutes/orderAdminRoutes";
import productAdminRoutes from "./adminRoutes/productAdminRoutes";
import categoryAdminRoutes from "./adminRoutes/categoryAdminRoutes";
import reviewAdminRoutes from "./adminRoutes/reviewAdminRoutes";
import returnsRefundsRoutes from "./adminRoutes/returnsRefundsRoutes";
import userAdminRoutes from "./adminRoutes/userAdminRoutes";

router.use(authController.protect);

router.use("/cart", cartAdminRoutes);
router.use("/order", orderAdminRoutes);
router.use("/product", productAdminRoutes);
router.use("/category", categoryAdminRoutes);
router.use("/review", reviewAdminRoutes);

router.use("/returns-refunds", returnsRefundsRoutes);
router.use("/user", userAdminRoutes);

export default router;
