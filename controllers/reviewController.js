import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Review from '../models/review';
import buildNestedReviews from '../utils/nestedReviews';

export const createReview = catchAsync(async (req, res, next) => {
  const { product, rating, review, parentReview } = req.body;
  const userId = req.user._id;

  const newReview = await Review.create({
    product: new mongoose.Types.ObjectId(product),
    userId,
    rating,
    review,
    parentReview,
  });
  console.log(newReview);
  res.status(201).json({
    status: "success",
    data: newReview,
  });
});

export const getReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ userId: req.user.id }).populate(
    "parentReview"
  );

  const nestedReviews = buildNestedReviews(reviews, null);

  res.status(200).json({
    status: "success",
    data: nestedReviews,
  });
});

export const getReviewsProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.productId; // Assuming you're passing the product ID in the URL

  const reviews = await Review.find({
    product: new mongoose.Types.ObjectId(productId),
  });
  const nestedReviews = buildNestedReviews(reviews, null);

  res.status(200).json({
    status: "success",
    data: nestedReviews,
  });
});
export const deleteReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;

  // Find the review and check if the logged-in user has permission to delete it
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }
  if (review.userId.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to delete this review", 403)
    );
  }
  // Delete the review
  await review.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
