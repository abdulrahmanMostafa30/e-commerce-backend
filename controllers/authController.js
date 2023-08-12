import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';

import User from '../models/user';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import sendEmail from '../utils/email';
import axios from 'axios';

const URL_FRONTEND = process.env.URL_FRONTEND;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
export const generateNewAccessToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies?.jwt_refresh;

  if (!refreshToken) {
    return next(new AppError("Refresh token is missing", 400));
  }

  try {
    // Verify the refresh token and obtain the user's ID
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const userId = decodedRefreshToken.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // If refresh token is valid, create a new access token
    createSendToken(user, 201, res);
  } catch (error) {
    // Handle any errors that might occur during token verification
    return next(new AppError("Invalid refresh token", 401));
  }
});

const createSendToken = (user, statusCode, res) => {
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );

  const accessToken = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", accessToken, cookieOptions);

  // Send the refresh token in the response
  const refreshCookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    refreshCookieOptions.secure = true;
    refreshCookieOptions.sameSite = "none";
  }
  res.cookie("jwt_refresh", refreshToken, refreshCookieOptions);

  // Remove sensitive data from the user object
  user.password = undefined;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpiresAt = undefined;

  res.status(statusCode).json({
    status: "success",
    token: accessToken,
    data: {
      user,
    },
  });
};

const verifyGoogleToken = async (token) => {
  const response = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
    params: {
      id_token: token,
      client_id: process.env.EMAIL_CLIENT_ID,
      client_secret: process.env.EMAIL_CLIENT_SECRET,
    },
  });
  const { data } = response;
  // Verify if the audience matches your client ID
  if (data.aud !== process.env.EMAIL_CLIENT_ID) {
    throw "Invalid token audience";
  }

  // Token is valid
  return data;
};

const loginGoogle = catchAsync(async (req, res, next, token) => {
  const verifiedToken = await verifyGoogleToken(token);
  if (!verifiedToken) {
    return next(new AppError("Token is invalid or failed verification", 401));
  }
  if (!verifiedToken.email) {
    return next(new AppError("Please provide email", 400));
  }
  const user = await User.findOne({ email: verifiedToken.email });
  if (!user) {
    return next(new AppError("Email does not exist", 400));
  }
  createSendToken(user, 201, res, refreshToken);
});

export const signup = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    birthDate,
    email,
    password,
    confirmPassword,
    country,
    address,
    // Other properties from userSchema
  } = req.body;

  let imagePath = req.body.imagePath;
  if (req.file) {
    if (req.file.uploadedImages) {
      imagePath = req.file.uploadedImages[0];
    }
  }
  console.log(imagePath)
  const newUser = await new User({
    firstName,
    lastName,
    username,
    birthDate,
    email,
    password,
    confirmPassword,
    country,
    address,
    imagePath,
    // Other properties from userSchema
  });
  console.log(newUser);

  await newUser.save();
  // await newUser.createVerificationCode();
  // await newUser.save({ validateBeforeSave: false });

  createSendToken(newUser, 201, res);
});
export const login = catchAsync(async (req, res, next) => {
  const { email, password, token } = req.body;
  if (token) {
    return await loginGoogle(req, res, next, token);
  }
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 201, res);
});
export const generate_verification_code = catchAsync(async (req, res, next) => {
  {
    const user = await User.findById(req.user.id);

    await user.createVerificationCode();
    await user.save({ validateBeforeSave: false });

    try {
      res.status(200).json({
        status: "success",
        message: "Email verification sent to email!",
      });
    } catch (err) {
      console.log(err);
      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  }
});

export const check_verification_code = catchAsync(async (req, res, next) => {
  const { verificationCode } = req.body;

  const user = await User.findById(req.user.id);
  const isCodeValid = await user.checkVerificationCode(verificationCode);
  if (isCodeValid) {
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Email verification successful" });
  } else {
    return next(new AppError("Invalid verification code"), 401);
  }
});

const verifyToken = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw "The user belonging to this token does no longer exist.";
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw "User recently changed password! Please log in again.";
  }
  return currentUser;
};

export const checkAuth = catchAsync(async (req, res, next) => {
  req.isAuthenticated = false;
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    next();
  }
  if (token) {
    try {
      const currentUser = await verifyToken(token);
      req.user = currentUser;
      req.isAuthenticated = true;
      next();
    } catch (error) {
      return next(new AppError(error));
    }
  }
});
export const protectEmailVerified = catchAsync(async (req, res, next) => {
  if (req.user.isEmailVerified) {
    next();
  } else {
    return next(new AppError("You need to Verify Email First!"));
  }
});
export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let refreshToken = req.cookies?.jwt_refresh;
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token || !refreshToken) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  if (token && refreshToken) {
    try {
      const currentUser = await verifyToken(token);
      req.user = currentUser;
      req.isAuthenticated = true;
      next();
    } catch (error) {
      return next(new AppError(error));
    }
  }
});



export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['instructor', 'admin']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email

  const resetLink = `${URL_FRONTEND}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message: `
      <h3>Forgot your password?</h3>
      <p>Don't worry! We've got you covered.</p>
      <p>Please click on the following link to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,</p>
      <p>The EduZone Team</p>
    `,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});
export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user._id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
