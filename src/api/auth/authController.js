const User = require('../../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  sendVerificationEmail,
  resetPasswordMail,
  forgotPasswordMail,
} = require('../../service/email/sendEmail');

const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(409).json({
      message: 'Username, email, and password are required',
      success: false,
    });
  }
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      verified: false,
    });

    await user.save();

    // Generate a token with the user's ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    // Email the user a unique verification link
    const url = `${process.env.APP_SERVICE_URL}/api/verify/${token}`;
    await sendVerificationEmail(user.email, 'Email Verification\n', url);
    console.log(token);

    const data = {
      user: {
        token,
        url,
        isVerified: user.isVerified,
        role: user.role,
      },
    };
    return res.status(201).json({
      data,
      message: `Account successfully created and verification email has been sent to ${user.email}`,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

const login = async (req, res) => {
  const { email, password, isVerified } = req.body;
  const { loginType } = req.query;
  try {
    if (!email && !password && !isVerified) {
      return res.status(400).json({
        message: 'All fields are required and you need to be verified.',
        success: false,
      });
    }

    // Check if the user exists
    const foundUser = await User.findOne({ email }).select('-password').exec();
    if (!foundUser) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false,
      });
    }

    // if query loginType is "admin"
    if (loginType === 'admin') {
      if (foundUser.role !== 'admin') {
        return res.status(406).json({
          message:
            'UNABLE TO ACCESS! Accessing the page or resource you were trying to reach is forbidden',
          success: false,
        });
      }
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        success: false,
      });
    }

    const data = {
      userInfo: {
        userId: foundUser._id,
        username: foundUser.username,
        avatar: foundUser.avatar,
        email: foundUser.email,
        role: foundUser.role,
        verified: foundUser.isVerified,
        isSubscribed: foundUser.isSubscribed,
      },
    };

    return res.status(200).json({
      data,
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
      message: 'Missing require token',
    });
  }
  // Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  } catch (error) {
    return res.status(500).json({ message: 'server error', success: false });
  }
  try {
    //Find user with matching ID
    const foundUser = await User.findOne({ _id: payload.id }).exec();
    if (!foundUser) {
      return res.status(404).json({
        message: 'User does not  exists',
      });
    }
    if (foundUser.isVerified) {
      return res.status(400).json({
        message: 'This user has already been verified.',
        foundUser,
      });
    }

    // Update user verification status to true
    foundUser.isVerified = true;
    await foundUser.save();
    return res.status(200).json({
      message: 'The account has been verified successfully.',
      user: {
        verified: foundUser.isVerified,
        _id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        avatar: foundUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(404).send({
        message: 'The email address does not exists',
      });
    }
    const token = await jwt.sign(
      { id: foundUser._id },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: '5min',
      }
    );

    // Email the user a unique reset password link
    const url = `${process.env.APP_SERVICE_URL}/api/resetPassword/${token}`;
    await resetPasswordMail(foundUser.email, 'Reset Password\n', url);
    console.log(token);
    const data = {
      user: {
        token,
        url,
        resetPasswordMail,
      },
    };
    return res.status(201).json({
      data,
      message: `Reset password successfully sent to ${foundUser.email}`,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error',
      success: false,
    });
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
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(404).json({
        message: 'The email address does not exists',
        success: false,
      });
    }

    const token = await jwt.sign(
      { id: foundUser._id },
      process.env.JWT_TOKEN_SECRET,
      {
        expiresIn: '5min',
      }
    );

    // Email the user a unique forgot password link
    const url = `${process.env.APP_SERVICE_URL}/api/resetPassword/${token}`;
    await forgotPasswordMail(foundUser.email, 'Forgot Password\n', url);
    console.log(token);

    // save update user
    await foundUser.save();

    return res.status(200).json({
      data: foundUser,
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

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (oldPassword === newPassword) {
    return res.status(400).json({
      message:
        'The request is missing required parameters or contain invalid data',
    });
  }
  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (isMatch) {
      const hashedPassword = await bcrypt.hash(newPassword, 16);
      await user.update({ password: hashedPassword });
      return res.status(200).json({
        message: 'Your password has been successfully reset',
        success: true,
      });
    } else {
      return res.status(401).json({
        message: 'The provided current password password is incorrect',
        success: false,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: 'Server error',
      success: false,
    });
  }
};

module.exports = {
  signup,
  login,
  resetPasswordLink,
  forgotPassword,
  changePassword,
  emailVerification,
};
