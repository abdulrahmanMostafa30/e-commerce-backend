

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import filterObj from '../utils/filterObj';
import * as  factory from './handlerFactory';
import User from '../models/user';

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
export const updateMe = catchAsync(async (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    if(req.file.uploadedImages){
      imagePath = req.file.uploadedImages[0];
    }
  }

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "fname",
    "lname",
    "fullName",
    "birthDate",
    "imagePath",
    "country",
    "address",
    "university",
    "faculty",
    "department",
    'courseProgress'
  );
  if (imagePath) {
    filteredBody["imagePath"] = imagePath;
  }
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
export const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};


export const getUser = factory.getOne(User);
export const getAllUsers = factory.getAll(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
