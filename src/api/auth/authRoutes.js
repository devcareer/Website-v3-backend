const express = require('express');
const router = express.Router();
const AuthController = require('../auth/authController');
const loginLimiter = require('../../middleware/LogLimiter');

router.route('/signup').post(AuthController.signup);

router.route('/login').post(loginLimiter, AuthController.login);

router.route('/forgot').post(AuthController.forgotPassword);

router.route('/verify/:token').post(AuthController.emailVerification);

router.route('/reset').get(AuthController.resetPasswordLink);

router.route('/change').post(AuthController.changePassword);

module.exports = router;
