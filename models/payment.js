import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: [true, 'Please provide a payment ID'],
    },
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
    amount: {
      type: Number,
      required: [true, 'Please provide the payment amount'],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
