const Joi = require('joi');

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(5).required(),
});

module.exports = resetPasswordSchema;
