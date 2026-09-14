const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parser with 25MB limit to support high-res Base64 image payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Static uploads folder (legacy support)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    brand: 'TIMEORA Horlogerie & Co.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start listening only when running directly (not in Vercel serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`  TIMEORA Horlogerie Backend Server Running      `);
    console.log(`  Mode: ${process.env.NODE_ENV || 'development'} `);
    console.log(`  Port: ${PORT}                                  `);
    console.log(`  URL:  http://localhost:${PORT}/api/status     `);
    console.log(`=================================================\n`);
  });
}

// Export app for Vercel serverless
module.exports = app;

