const Joi = require('joi');

const signupSchema = Joi.object({
  username: Joi.string().min(4).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).required(),
  confirmPassword: Joi.string().min(5).required(),
  avatar: Joi.string().default('no-image.png'),
  isVerified: Joi.boolean().default(false),
  loginAttempts: Joi.number().default(0),
  resetPasswordAttempts: Joi.number().default(0),
  changePasswordAttempts: Joi.number().default(0),
  refreshToken: Joi.array().items(Joi.string()),
});

module.exports = signupSchema;
