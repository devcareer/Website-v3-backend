const express = require('express');
const router = express.Router();
const authController = require('../auth/authController');
const loginLimiter = require('../../middleware/LogLimiter');

router.route('/signup').post(authController.signup);

router.route('/login').post(loginLimiter, authController.login);

router.route('/forgot').post(authController.forgotPassword);

router.route('/verify').post(authController.emailVerification);

router.route('/reset').get(authController.resetPasswordLink);

router.route('/change').post(authController.changePassword);

module.exports = router;
