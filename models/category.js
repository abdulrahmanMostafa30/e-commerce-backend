import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
