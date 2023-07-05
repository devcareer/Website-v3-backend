const signup = require('./signupSchema');
const login = require('./loginSchema');
const changePassword = require('./changePasswordSchema');
const resetPassword = require('./resetPasswordSchema');

module.exports = {
  signup,
  login,
  changePassword,
  resetPassword,
};
