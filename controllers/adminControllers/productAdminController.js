

import filterObj from '../../utils/filterObj';
import catchAsync from '../../utils/catchAsync';
import Product from '../../models/product';
import AppError from '../../utils/appError';
import * as  factory from '../handlerFactory';

const extractImagesFromRequest = (req) => {
  let images = [];
  if (req.uploadedImages) {
    images = req.uploadedImages.map((image) => ({
      path: image,
      caption: "",
      altText: "",
    }));
  }

  return images;
};

export const createProduct = catchAsync(async (req, res, next) => {
  const images = extractImagesFromRequest(req);

  if (!images || images.length === 0) {
    return next(new AppError("At least one image is required.", 400));
  }

  const newProduct = await Product.create({
    ...filterObj(
      req.body,
      "title",
      "description",
      "price",
      "category",
      "availability",
      "brand"
    ),
    images,
  });

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const images = extractImagesFromRequest(req);

  const allowedFields = [
    "title",
    "description",
    "price",
    "category",
    "availability",
    "brand",
  ];
  const updateData = filterObj(req.body, ...allowedFields);

  if (images.length > 0) {
    updateData.images = images;
  } else if (req.body.images) {
    updateData.images = req.body.images;
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateData,
    { new: true }
  );
  if (!updatedProduct) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedProduct,
  });
});
export const deleteProduct = factory.deleteOne(Product);

