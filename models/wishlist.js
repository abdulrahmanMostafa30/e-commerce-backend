import mongoose from 'mongoose';

const wishlistProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  // Additional fields to store product details or preferences in wishlist
},
{
  timestamps: true,
});

const WishlistProduct = mongoose.model("WishlistProduct", wishlistProductSchema);
export default WishlistProduct;
