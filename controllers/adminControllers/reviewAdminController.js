

import catchAsync from '../../utils/catchAsync';
import Review from '../../models/review';
import AppError from '../../utils/appError';

export const deleteReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError("Review not found", 404));
  }
  await review.deleteOne();
  res.status(204).json({
    status: "success",
    data: null,
  });
});
export const updateReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const { rating, review } = req.body;

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, review },
      { new: true }
    );

    if (!updatedReview) {
      return next(new AppError("Review not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: updatedReview,
    });
  } catch (err) {
    return next(new AppError("Error updating review", 500));
  }
});
