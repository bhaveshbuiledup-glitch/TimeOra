const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const setupAdmin = async () => {
  const loginId = String(process.env.ADMIN_LOGIN_ID || '').trim().toLowerCase();
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD || '';
  const name = String(process.env.ADMIN_NAME || 'TIMEORA Admin').trim();

  if (!/^[a-z0-9_-]{3,40}$/.test(loginId)) {
    throw new Error('ADMIN_LOGIN_ID must be 3-40 characters: lowercase letters, numbers, underscore, or hyphen.');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Set a valid ADMIN_EMAIL in server/.env.');
  }
  if (password.length < 6) {
    throw new Error('Set ADMIN_INITIAL_PASSWORD in server/.env (at least 6 characters).');
  }

  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timeora_watches');

  const existingById = await User.findOne({ adminLoginId: loginId });
  const existingByEmail = await User.findOne({ email });
  if (existingByEmail && existingByEmail.role !== 'admin') {
    throw new Error('That email already belongs to a customer. Use a separate admin email; customer accounts are never promoted by this script.');
  }
  if (existingById && existingByEmail && String(existingById._id) !== String(existingByEmail._id)) {
    throw new Error('That admin ID and email belong to different accounts. Resolve the account assignment before continuing.');
  }

  const user = existingById || existingByEmail || new User({ email });
  user.name = name || user.name;
  user.email = email;
  user.adminLoginId = loginId;
  user.role = 'admin';
  user.isActive = true;
  user.password = password;
  await user.save();
  await mongoose.disconnect();

  console.log(`Admin account is ready for login ID: ${loginId}`);
  console.log('Password saved as a bcrypt hash. Remove ADMIN_INITIAL_PASSWORD from server/.env now.');
};

setupAdmin().catch(async (error) => {
  await mongoose.disconnect().catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
});
