const express = require('express');
const router = express.Router();
const AuthController = require('../auth/authController');
const { ensuredAuthenticated } = require('../../middleware/authentication');
const validator = require('../../middleware/validator');

router.route('/signup').post(validator('signup'), AuthController.signup);

router.route('/login').post(validator('login'), AuthController.login);

router.route('/logout').delete(AuthController.logout);

router.route('/forgot').post(AuthController.forgotPassword);

router
  .route('/verify/:token')
  .get(AuthController.emailVerification);

router
  .route('/getResetLink')
  .get(ensuredAuthenticated, AuthController.resetPasswordLink);

router
  .route('/reset')
  .post(validator('resetPassword'), AuthController.resetPassword);

router
  .route('/change')
  .post(validator('changePassword'), AuthController.changePassword);

module.exports = router;
