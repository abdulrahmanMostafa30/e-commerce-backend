import Category from '../../models/category';
import * as  factory from '../handlerFactory';

// Create a new category
export const createCategory = factory.createOne(Category);
export const updateCategory = factory.updateOne(Category);
export const deleteCategory = factory.deleteOne(Category);
