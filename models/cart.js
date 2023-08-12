import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    items: [
      {
        _id: false,
        item: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

cartSchema.methods.calculateTotalPrice = async function () {
  await this.populate('items.item');
  let totalPrice = 0;

  for (const item of this.items) {
    totalPrice += item.item.price * item.quantity;
  }

  return totalPrice;
};

cartSchema.methods.addProduct = async function (productId, quantity = 1) {
  const existingItem = this.items.find((item) => item.item.equals(productId));

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ item: productId, quantity });
  }

  await this.save();
};

cartSchema.methods.removeProduct = async function (productId, quantity = 1) {
  const existingItem = this.items.find((item) => item.item.equals(productId));

  if (existingItem) {
    existingItem.quantity -= quantity;

    if (existingItem.quantity <= 0) {
      const itemIndex = this.items.indexOf(existingItem);
      this.items.splice(itemIndex, 1);
    }

    await this.save();
  }
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
