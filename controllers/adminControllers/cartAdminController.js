import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';
import Cart from '../../models/cart';

export const getUserCart = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const userCart = await Cart.findOne({ userId }).populate('items.item');
  if (!userCart) {
    return next(new AppError("User's cart not found", 404));
  }
  res.status(200).json({
    status: 'success',
    data: userCart,
  });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;
  const updatedCart = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { item: itemId } } },
    { new: true }
  );
  if (!updatedCart) {
    return next(new AppError("Item not found in the user's cart", 404));
  }
  res.status(200).json({
    status: 'success',
    data: updatedCart,
  });
});
