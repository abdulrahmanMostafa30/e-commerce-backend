

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import * as factory from './handlerFactory';
import Category from '../models/category';
import Product from '../models/product';

export const getAllProducts = catchAsync(async (req, res, next) => {
  const page = req.query.page || 1;
  let limit = req.query.limit || 10;
  limit = Math.min(limit, 10);

  const startIndex = (page - 1) * limit;

  const query = Product.find();

  // 1. Search: Basic search using title
  if (req.query.search) {
    query.find({ title: { $regex: req.query.search, $options: "i" } });
  }

  // 2. Sort: Sort by categories or brands (add more as needed)
  if (req.query.sortBy) {
    const sortByFields = req.query.sortBy.split(",");
    query.sort(sortByFields.join(" "));
  }

  // 3. Filter: Filter by categories, brands, and price range
  if (req.query.categories) {
    const categoryNames = req.query.categories.split(",");
    const categoryIds = await Category.find({ name: { $in: categoryNames } }).distinct("_id");
    query.populate("category"); // Populate the 'category' field
    query.where("category").in(categoryIds);
  }
  if (req.query.brands) {
    const brands = req.query.brands.split(",");
    query.where("brand").in(brands);
  }
  if (req.query.minPrice) {
    query.where("price").gte(parseFloat(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    query.where("price").lte(parseFloat(req.query.maxPrice));
  }

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limit);

  const products = await query.skip(startIndex).limit(limit);

  res.status(200).json({
    status: "success",
    data: products,
    pagination: {
      currentPage: page,
      totalPages,
      totalProducts,
      endIndex: startIndex + products.length,
    },
  });
});

export const getProductById = factory.getOne(Product);

export const getRelatedProducts = catchAsync(async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Fetch related products based on product attributes
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: productId }, // Exclude the current product
  }).limit(4);

  res.status(200).json({
    status: "success",
    data: relatedProducts,
  });
});
