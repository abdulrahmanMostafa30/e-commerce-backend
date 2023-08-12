import * as  factory from '../handlerFactory';
import User from '../../models/user';


export const getAllUsers = factory.getAll(User);
export const getUserById = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);

// Add more controller functions for user-related admin functionalities as needed
