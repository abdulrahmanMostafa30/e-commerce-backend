import mongoose from 'mongoose';

const { Schema } = mongoose;

const orderSchema = new Schema(
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
        },
      },
    ],
    name: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash_on_delivery'],
      required: true,
    },
    cardTransactionId: {
      type: String,
    },
    cashOnDeliveryInstructions: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
