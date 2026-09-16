const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB().then(async () => {
  try {
    const user = await User.findOne({ email: 'timeoraa@gmail.com' }).select('+password');
    console.log('User found:', !!user);
    console.log('Password exists:', !!user.password);
    console.log('Password hash:', user.password);
    const isMatch = await user.matchPassword('Time@1266');
    console.log('Match:', isMatch);
  } catch (error) {
    console.error('Error in script:', error);
  }
  process.exit();
});
