const jwt = require('jsonwebtoken');
const User = require('../model/user');

// Middleware for detect authenticated logging user
module.exports.ensuredAuthenticated = async (req, res, next) => {
  try {
    // get access token form authorization headers
    const { authorization } = req.headers;

    console.log('This is the authorization token ' + authorization);

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(403).json({
        message: 'ACCESS FORBIDDEN! Authorization headers is required.',
      });
    }

    // split token from authorization header
    const token = authorization.split(' ')[1];

    // verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, dec) => {
      if (err) {
        return res.status(404).json({
          message:
            'JWT TOKEN INVALID! JWT token is expired/invalid. Please logout and login again',
        });
      }

      // check if user exists
      const user = await User.findById(dec.UserInfo.userId);

      if (!user) {
        return res.status(404).json({
          message: 'UNKNOWN ACCESS! Authorization headers is missing/invalid.',
        });
      }
      req.body.userId = dec.UserInfo.userId;
      req.body.username = dec.UserInfo.username;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
