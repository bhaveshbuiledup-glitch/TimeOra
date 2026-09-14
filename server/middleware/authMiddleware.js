const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'timeora_super_secret_jwt_horology_key_2024');

      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error('Token authorization failed:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed verification' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token supplied' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an administrator' });
  }
};

module.exports = { protect, admin };
