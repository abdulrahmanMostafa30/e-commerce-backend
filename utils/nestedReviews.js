function buildNestedReviews(reviews, parentReviewId = null) {
  return reviews
    .filter((review) => {
      if (parentReviewId) {
        return (
          review.parentReview &&
          review.parentReview._id.toString() === parentReviewId
        );
      } else {
        return !review.parentReview;
      }
    })
    .map((review) => ({
      _id: review._id,
      productId: review.product._id,
      userId: review.userId,
      rating: review.rating,
      review: review.review,
      parentReview: buildNestedReviews(reviews, review._id.toString()),
      createdAt: review.createdAt,
    }));
}

export default buildNestedReviews;
