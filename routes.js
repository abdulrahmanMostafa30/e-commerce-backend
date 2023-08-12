import productRoute from './routes/productRoutes';
import categoryRoute from './routes/categoryRoutes';
import reviewRoute from './routes/reviewRoutes';

import userRoute from './routes/userRoutes';
import cartRoute from './routes/cartRoutes';
import authRoutes from './routes/authRoutes';
import wishlistRoute from './routes/wishlistRoutes';
import adminRoutes from './routes/adminRoutes';

import express from 'express';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

router.use('/users/auth', userRoute);
router.use('/product', productRoute);
router.use('/category', categoryRoute);
router.use('/review', reviewRoute);

router.use('/cart', cartRoute);
router.use('/wishlist', wishlistRoute); // Wishlist
export default router;
