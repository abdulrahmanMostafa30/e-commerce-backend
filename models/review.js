import mongoose from 'mongoose';

import autopopulate from 'mongoose-autopopulate';

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    autopopulate: true, // Enable autopopulation for nested reviews
    default: null,
  },
},
{
  timestamps: true,
});
ReviewSchema.plugin(autopopulate);

const Review = mongoose.model("Review", ReviewSchema);
export default Review;