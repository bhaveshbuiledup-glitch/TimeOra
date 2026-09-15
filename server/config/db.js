const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/timeora_watches';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`[TIMEORA Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[TIMEORA Database] MongoDB connection FAILED: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[TIMEORA Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[TIMEORA Database] MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('connected', () => {
  console.log('[TIMEORA Database] MongoDB connected.');
});

module.exports = connectDB;
