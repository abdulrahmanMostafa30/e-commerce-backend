import catchAsync from '../utils/catchAsync';
import Wishlist from '../models/wishlist';
import AppError from '../utils/appError';
import mongoose from 'mongoose';


export const getWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const wishlist = await Wishlist.find({ userId}).populate("product");

  res.status(200).json({
    status: "success",
    data: wishlist,
  });
});

export const addToWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  const existingWishlist = await Wishlist.findOne({
    userId: userId,
    product: new mongoose.Types.ObjectId(productId),
  });

  if (existingWishlist) {
    return next(new AppError("Product already exists in wishlist", 400));
  }

  const newWishlist = await Wishlist.create({
    userId: userId,
    product: new mongoose.Types.ObjectId(productId),
  });

  res.status(201).json({
    status: "success",
    data: newWishlist,
  });
});

export const removeFromWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  const deletedWishlist = await Wishlist.findOneAndDelete({
    userId: userId,
    product: new mongoose.Types.ObjectId(productId),
  });

  if (!deletedWishlist) {
    return next(new AppError("Product not found in wishlist", 404));
  }

  res.status(200).json({
    status: "success",
    data: { message: "Product removed from wishlist" },
  });
});
