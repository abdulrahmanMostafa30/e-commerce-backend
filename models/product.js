import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a product category'],
    },
    brand: {
      type: String,
      required: [true, 'Please provide a product brand'],
    },
    images: [
      {
        path: {
          type: String,
        },
        caption: {
          type: String,
        },
        altText: {
          type: String,
        },
      },
    ],
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
    },
    availability: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
