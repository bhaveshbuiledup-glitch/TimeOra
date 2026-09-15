const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'timeora_super_secret_jwt_horology_key_2024');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
      return next();
    }
  } catch (error) {
    console.error('Token authorization failed:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed verification' });
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no bearer token supplied' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Not authorized as an administrator' });
};

module.exports = { protect, admin };
