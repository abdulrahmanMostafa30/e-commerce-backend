import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Category from '../models/category';
import filterObj from '../utils/filterObj';

export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

export const createCategory = catchAsync(async (req, res, next) => {
  const allowedFields = ["name", "description", "parentCategory", "thumbnail"];
  const filteredData = filterObj(req.body, ...allowedFields);

  const newCategory = await Category.create(filteredData);

  res.status(201).json(newCategory);
});


export const updateCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.id;

  // List of fields allowed to be updated
  const allowedFields = ["name", "description", "parentCategory", "thumbnail"];

  // Filter the req.body using allowedFields
  const updateData = filterObj(req.body, ...allowedFields);

  const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, {
    new: true,
  });

  if (!updatedCategory) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedCategory,
  });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.id;

  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  if (!deletedCategory) {
    return res.status(404).json({ message: "Category not found." });
  }

  res.status(200).json({ message: "Category deleted successfully." });
});
