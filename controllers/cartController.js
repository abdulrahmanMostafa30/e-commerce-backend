import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Cart from '../models/cart';

export const getCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id; 
  const cart = await Cart.findOne({ userId }).populate("items.item");

  res.status(200).json({
    status: "success",
    data: cart,
  });
});
export const updateCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { action, productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId });
  }

  if (action === "add") {
    await cart.addProduct(productId, quantity);
  } else if (action === "remove") {
    await cart.removeProduct(productId, quantity); // Remove the specified quantity
  } else if (action === "removeAll") {
    cart.items = []; // Remove all items from the cart
  } else if (action === "removeAllQuantities") {
    const productIndex = cart.items.findIndex(
      (item) => item.item && item.item.toString() === productId
    );
    if (productIndex !== -1) {
      cart.items.splice(productIndex, 1); // Remove the product from the items array
    }
  } else {
    return next(new AppError("Invalid action", 400));
  }

  await cart.save();

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

export const addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id; 
  const productId = req.body.productId;
  const quantity = req.body.quantity;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId });
  }

  await cart.addProduct(productId, quantity);

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  await cart.removeProduct(productId);

  res.status(200).json({
    status: "success",
    data: cart,
  });
});
export const removeAllFromCart = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const updatedCart = await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedCart,
  });
});

export const removeAllQuantitiesOfProductFromCart = catchAsync(
  async (req, res, next) => {
    const userId = req.user.id; 
    const productId = req.params.productId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    const productIndex = cart.items.findIndex(
      (item) => item.item && item.item.toString() === productId
    );

    if (productIndex === -1) {
      return next(new AppError("Product not found in cart", 404));
    }

    cart.items.splice(productIndex, 1);

    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart,
    });
  }
);
