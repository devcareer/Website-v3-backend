const User = require('../../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  sendVerificationEmail,
  resetPasswordMail,
  forgotPasswordMail,
} = require('../../service/email/sendEmail');

const signup = async (req, res) => {
  let { username, email, password, confirmPassword } = req.body;
  // make the username lowercase
  username = username.toLowerCase();
  if (!username || !email || !password || !confirmPassword) {
    return res.status(409).json({
      message: 'Username, email, and password are required',
      success: false,
    });
  }

  // Check if password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: 'Password and confirm password do not match',
      success: false,
    });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).exec();

    if (existingUser) {
      if (existingUser.email === email) {
        // Email already exists
        if (existingUser.isVerified) {
          return res.status(400).json({
            message: 'Email already exists and is already verified.',
            success: false,
          });
        } else {
          // Check if the verification token has expired
          const currentTime = Date.now(); // Convert milliseconds to seconds
          if (existingUser.emailVerificationTokenExpiresAt < currentTime) {
            // The token has expired, delete the previous user account
            await User.findByIdAndDelete(existingUser._id).exec();
          } else {
            return res.status(400).json({
              message:
                'Email already exists, and verification token is still valid.',
              success: false,
            });
          }
        }
      } else {
        return res.status(400).json({
          message: 'Username already exists',
          success: false,
        });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      emailVerificationTokenExpiresAt: Date.now() + 180 * 1000, // 3 minutes from now
    });
    await user.save();

    // Generate a token with the ID
    const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '24h',
    });

    // Email the user a unique verification link
    const url = `${process.env.APP_SERVICE_URL}/api/v1/auth/verify/${token}`;
    await sendVerificationEmail(user.email, 'Email Verification\n', url);

    const data = {
      user: {
        isVerified: user.isVerified,
      },
    };

    return res.status(201).json({
      data,
      message: `Account successfully created and verification email has been sent to ${user.email}`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required fields.',
      success: false,
    });
  }
  try {
    // Check if the user exists
    const foundUser = await User.findOne({ email })
      .select('+password +loginAttempts +isVerified')
      .exec();
    if (!foundUser) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false,
      });
    }

    // Check if the user is verified
    if (!foundUser.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in.',
        success: false,
      });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      // Increment the login attempt counter for wrong password
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { $inc: { loginAttempts: 1 } },
        { new: true }
      );
      // Check if maximum login attempts exceeded
      if (updatedUser.loginAttempts >= 3) {
        return res.status(401).json({
          message:
            'Maximum login attempts exceeded. Please register or use forgot password to be able to access your account.',
          success: false,
        });
      }
      return res.status(401).json({
        message: 'Invalid credentials',
        success: false,
      });
    }

    // Generate JWT token with login status
    const accessToken = jwt.sign(
      {
        UserInfo: {
          userId: foundUser._id,
          username: foundUser.username,
          email: foundUser.email,
          avatar: foundUser.avatar,
          verified: foundUser.isVerified,
          updatedAt: Date.now(),
          new: true,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    const newRefreshToken = jwt.sign(
      {
        username: foundUser.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Reset the login attempt counter on successful login
    await User.findOneAndUpdate(
      { email },
      { $set: { loginAttempts: 0 } },
      { new: true }
    );

    const data = {
      user: {
        userId: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        avatar: foundUser.avatar,
        verified: foundUser.isVerified,
        loginAttempts: foundUser.loginAttempts,
        resetPasswordAttempts: foundUser.resetPasswordAttempts,
        changePasswordAttempts: foundUser.changePasswordAttempts,
        emailVerificationTokenExpiresAt:
          foundUser.emailVerificationTokenExpiresAt,
      },
    };

    // Successful login
    console.log('This is the login token ' + accessToken);
    return res.status(200).json({
      data,
      accessToken,
      message: 'Login is successful',
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

const emailVerification = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(422).json({
      message: 'Missing required token',
    });
  }

  try {
    // Verify the token from the URL
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user with matching ID
    const foundUser = await User.findOne({ _id: payload._id }).exec();
    if (!foundUser) {
      return res.redirect(`${process.env.ERROR_MESSAGE_URL}`);
      // return res.status(404).json({
      //   message: 'User does not exist',
      // });
    }

    if (foundUser.isVerified)
      return res.redirect(`${process.env.ERROR_MESSAGE_URL}`);
    /**{
      console.log('User is already verified');
      return res.status(400).json({
        message: 'This user has already been verified.',
        foundUser,
      });
    }
    */
    // Check if the verification token has expired
    const currentTime = Date.now();
    const tokenExpirationTime = foundUser.emailVerificationTokenExpiresAt;
    if (!tokenExpirationTime || tokenExpirationTime < currentTime)
      return res.redirect(`${process.env.ERROR_MESSAGE_URL}`);
    /**
    {
      console.log('Token has expired:', tokenExpirationTime, currentTime);
      return res.status(400).json({
        message: 'Verification token has expired.',
      });
    }
    */
    // Update user verification status to true
    foundUser.isVerified = true;
    await foundUser.save();

    console.log('User verification success:', foundUser);

    // Redirect user to the frontend login page
    return res.redirect(`${process.env.EMAIL_VERIFY_BASE_URL}`);
    /**
    return res.status(200).json({
      message: 'The account has been verified successfully.',
      user: {
        verified: foundUser.isVerified,
        username: foundUser.username,
      },
    });
    **/
  } catch (error) {
    /**
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token has expired:', error);
      return res.status(400).json({
        message: 'Verification token has expired.',
        success: false,
        expiredAt: error.expiredAt, // Include the expiredAt timestamp in the response
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Other token verification error:', error);
      return res.status(400).json({
        message: 'Invalid verification token.',
        success: false,
      });
    } else {
      console.log('Other error:', error);
      return res.status(500).json({
        message: 'Server error',
        success: false,
      });
    }
    */
    console.log('Other error:', error);
    return res.redirect(`${process.env.ERROR_MESSAGE_URL}`);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message:
        'The request is missing required parameters or contain invalid data',
    });
  }
  try {
    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      return res.status(404).json({
        message: 'The email address does not exists',
        success: false,
      });
    }

    const token = await jwt.sign(
      { id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '5min',
      }
    );

    // Email the user a unique forgot password link
    // const resetPasswordUrl = `${process.env.APP_SERVICE_URL}/api/v1/auth/reset/${token}`;
    const resetPasswordUrl = `${process.env.RESET_PASSWORD_BASE_URL}/api/resetPassword/${token}`;
    await forgotPasswordMail(
      foundUser.email,
      'Forgot Password\n',
      resetPasswordUrl
    );

    // save update user
    await foundUser.save();

    console.log(`The password was successfully reset`);
    return res.status(200).json({
      message: `The password was successfully reset`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'server error',
      success: false,
    });
  }
};

const resetPasswordLink = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  try {
    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      return res.status(404).send({
        message: 'The email address does not exists',
      });
    }

    const token = await jwt.sign(
      { id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '5min',
      }
    );

    // Email the user a unique reset password link
    // const resetPasswordUrl = `${process.env.APP_SERVICE_URL}/api/v1/reset/${token}`;
    const resetPasswordUrl = `${process.env.RESET_PASSWORD_BASE_URL}/api/resetPassword/${token}`;
    await resetPasswordMail(
      foundUser.email,
      'Reset Your Password',
      resetPasswordUrl
    );

    const data = {
      user: {
        resetPasswordMail,
      },
    };
    return res.status(201).json({
      data,
      message: `Reset password successfully sent to ${foundUser.email}`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token and password are required',
        success: false,
      });
    }

    // Verify the reset token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user by their ID
    const foundUser = await User.findById(decoded.id)
      .select('+_id +resetPasswordAttempts')
      .exec();
    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        success: false,
      });
    }

    // Check if the provided password matches the user's current password
    const isMatch = await bcrypt.compare(newPassword, foundUser.password);
    if (isMatch) {
      // Increment the reset passwordAttempt counter for wrong password
      const updatedUser = await User.findOneAndUpdate(
        { _id: decoded.id },
        { $inc: { resetPasswordAttempts: 1 } },
        { new: true }
      );

      // Check if maximum reset passwordAttempt exceeded
      if (updatedUser.resetPasswordAttempts >= 3) {
        return res.status(401).json({
          message:
            'Maximum reset password attempts exceeded. Please provide new password to be able to reset your password.',
          success: false,
        });
      }
      return res.status(400).json({
        message: 'New password must be different from the current password',
        success: false,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    foundUser.password = hashedPassword;

    // Reset the reset password attempts counter on successful password reset
    foundUser.resetPasswordAttempts = 0;

    // Save the changes to the user document
    await foundUser.save();
    return res.status(200).json({
      message: 'Password reset successful',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, userId } = req.body;
  if (currentPassword === newPassword) {
    return res.status(400).json({
      message: 'You can not use old password as a new password',
    });
  }
  try {
    const foundUser = await User.findById(userId)
      .select('+password +changePasswordAttempts')
      .exec();
    // Check if the user exists
    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(currentPassword, foundUser.password);
    if (isMatch) {
      // Passwords match, update the password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      foundUser.password = hashedPassword;
      // Reset the change password attempts counter
      foundUser.changePasswordAttempts = 0;
      await foundUser.save();

      return res.status(200).json({
        message: 'Your password has been successfully changed',
        success: true,
      });
    } else {
      // Passwords don't match, increment the change password attempts counter
      const foundUser = await User.findOneAndUpdate(
        { _id: userId },
        { $inc: { changePasswordAttempts: 1 } },
        { new: true }
      );

      // Check if maximum change password attempts exceeded
      if (foundUser.changePasswordAttempts >= 3) {
        return res.status(401).json({
          message:
            'Maximum change password attempts exceeded. Please register or use forgot password to be able to access your account.',
          success: false,
        });
      }
      return res.status(401).json({
        message: 'The provided current password password is incorrect',
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

//There is need for logout just to clear cookie if exists
const logout = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    return res.status(204).json({
      message: 'The refreshToken is successfully cleared',
      success: false,
    });
  }

  // update user status & updateAt time
  await User.findByIdAndUpdate(
    foundUser._id,
    { status: 'logout', updatedAt: Date.now() },
    { new: true }
  );

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.status(200).json({
    data,
    message: 'Cookie cleared',
    success: true,
  });
};

module.exports = {
  signup,
  login,
  logout,
  resetPasswordLink,
  resetPassword,
  forgotPassword,
  changePassword,
  emailVerification,
};
