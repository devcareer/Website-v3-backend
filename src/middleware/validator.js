const createHttpError = require('http-errors');
const Joi = require('joi');
const Validators = require('../validations/index');

module.exports = function (validator) {
  if (!Validators.hasOwnProperty(validator)) {
    throw new Error(`'${validator}' validator is not exist`);
  }

  return async function (req, res, next) {
    try {
      const schema = Validators[validator];
      const validated = await schema.validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof Joi.ValidationError) {
        return next(createHttpError(422, { message: err.message }));
      }
      next(createHttpError(500));
    }
  };
};
