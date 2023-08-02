const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'no-image.png',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    resetPasswordAttempts: {
      type: Number,
      default: 0,
    },
    changePasswordAttempts: {
      type: Number,
      default: 0,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);
