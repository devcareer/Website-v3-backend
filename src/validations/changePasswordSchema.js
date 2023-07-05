const Joi = require('joi');

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(5).required(),
  newPassword: Joi.string().min(5).required(),
});

module.exports = changePasswordSchema;
