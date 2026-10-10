const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Connect to MongoDB
connectDB();

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || '*';
app.use(
  cors({
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// General Rate Limiter
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    app: 'FitTrack REST API',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/workouts', require('./routes/workoutRoutes'));
app.use('/api/v1/food', require('./routes/foodRoutes'));
app.use('/api/v1/water', require('./routes/waterRoutes'));
app.use('/api/v1/goals', require('./routes/goalRoutes'));
app.use('/api/v1/metrics', require('./routes/metricRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/ai', require('./routes/aiRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// 404 & Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` FitTrack API Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Error: ${err.message}`);
});
