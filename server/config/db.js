const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/timeora_watches', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[TIMEORA Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[TIMEORA Database Warning] MongoDB connection offline or unavailable: ${error.message}`);
    console.warn('[TIMEORA Database] Running with in-memory fallback catalog for local testing.');
  }
};

module.exports = connectDB;
