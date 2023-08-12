import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import catchAsync from '../utils/catchAsync';
import sendEmail from '../utils/email';

const URL_FRONTEND = process.env.URL_FRONTEND;

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Please tell us your username!"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please tell us your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.default.isEmail, "Please provide a valid email"],
  },
  firstName: {
    type: String,
    required: [true, "Please tell us your first name!"],
  },
  lastName: {
    type: String,
    required: [true, "Please tell us your last name!"],
  },
  birthDate: {
    type: String,
    required: [true, "Please tell us your birthDate!"],
  },
  phone: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: [true, "please provide a password!"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "please confirm a password!"],
    minlength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password is not the same!",
    },
  },

  imagePath: {
    type: String,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: {
    type: String,
    required: false,
    select: false,
  },
  emailVerificationExpiresAt: {
    type: Date,
    required: false,
    select: false,
  },
  role: {
    type: String,
    enum: [
      "user",
      "superAdmin",
      "productAdmin",
      "orderAdmin",
      "customerServiceAdmin",
    ],
    default: "user",
  },
},
{
  timestamps: true,
});

userSchema.pre("save", async function (next) {
  // only if password is Modified
  if (!this.isModified("password")) {
    return next();
  }
  // hash password to databse
  this.password = await bcrypt.hash(this.password, 12);

  // delete confirmPassword from srore in database
  this.confirmPassword = undefined;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};
userSchema.methods.createVerificationCode = async function () {
  const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  const verificationCodeValidityMinutes = 10; // Set the validity duration for the verification code (in minutes)
  const verificationUrl = `${URL_FRONTEND}/verification?code=${verificationCode}`;

  const message = `
    <html>
      <body>
        <h1>Verify Your Email</h1>
        <p>Dear ${this.fname},</p>
        <p>Thank you for signing up. To verify your email, please click on the following link:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link is valid for ${verificationCodeValidityMinutes} minutes.</p>
        <p>Best regards,<br>The EduZone Team</p>
      </body>
    </html>
  `;

  await sendEmail({
    email: this.email,
    subject: "Email Verification",
    message: message,
  });
  this.emailVerificationCode = verificationCode;
  this.emailVerificationExpiresAt = new Date(expirationTime);
  return verificationCode;
};
userSchema.methods.checkVerificationCode = async function (enteredCode) {
  const user = await this.constructor
    .findById(this._id)
    .select("+emailVerificationCode +emailVerificationExpiresAt")
    .exec();

  if (!user) {
    return false; // User not found
  }

  const storedCode = user.emailVerificationCode;
  const storedExpiration = user.emailVerificationExpiresAt;
  if (!storedCode || !storedExpiration) {
    return false; // Verification code or expiration not found
  }

  const isCodeValid = storedCode === enteredCode;
  const isCodeExpired = storedExpiration <= Date.now();
  user.emailVerificationCode = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });

  return isCodeValid && !isCodeExpired;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;