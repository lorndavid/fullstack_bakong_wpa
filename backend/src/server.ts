import dotenv from 'dotenv';
dotenv.config();
 
import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import { configureCloudinary } from './config/cloudinary';
import routes from './routes';
import path from 'path';
import helmet from 'helmet';
import errorHandler from './middlewares/errorHandler';
import { startPaymentWatcher } from './services/paymentWatcher';
import { initSocket } from './services/socket';
import { processScheduledNotifications } from './services/notificationService';
import http from 'http';
import logger, { dbLogger, httpLogger, correlationIdMiddleware } from './services/logger';
import { apiLimiter } from './middlewares/rateLimiter';
 
const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
 
// Configure Cloudinary
configureCloudinary();
 
// Trust proxy — required by helmet HSTS, rate limiting, and pino-http
// to correctly detect the client IP behind Nginx / Cloudflare.
// Set to the number of proxy hops (1 for a single reverse proxy like Nginx).
// Using `true` is rejected by express-rate-limit v7+ as a security risk
// because it allows anyone to spoof their IP via X-Forwarded-For.
app.set('trust proxy', 1);

// Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.lorndavid.online'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Request logging (pino-http) — logs method, URL, status, and response time for every request
app.use(httpLogger);

// Correlation ID response header
app.use(correlationIdMiddleware);

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedDomains = [
      'lorndavid.online',
      'www.lorndavid.online',
      'admin.lorndavid.online',
    ];

    // Check if the origin matches our specific domains or ends with .vercel.app
    if (
      allowedDomains.includes(new URL(origin).hostname) || 
      origin.endsWith('.vercel.app') || 
      origin.startsWith('http://localhost')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
 
// Serve uploaded files statically (local file storage fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global API rate limiter — 500 req / 15 min on ALL API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);

// Root route — welcome / API info
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Bakong E-commerce API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      payments: '/api/payment',
      users: '/api/users',
      promotions: '/api/promotions',
      coupons: '/api/coupons',
      notifications: '/api/notifications',
      chat: '/api/chat',
      inventory: '/api/inventory',
      settings: '/api/settings',
      'hero-slides': '/api/hero-slides',
    },
    timestamp: new Date().toISOString(),
  });
});

// Error Handler
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});
 
// Initialize Socket.IO
initSocket(httpServer);
 
// Start server (don't block on DB connection)
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`API: http://localhost:${PORT}/api`);
  logger.info(`Health: http://localhost:${PORT}/api/health`);
});
 
// Connect to MongoDB asynchronously (won't block server startup)
connectDB().then(() => {
  // Start the payment watcher once DB is connected
  startPaymentWatcher();
  // Start processing scheduled notifications
  processScheduledNotifications();
  // Check every 60 seconds for due notifications
  const scheduledNotifInterval = setInterval(processScheduledNotifications, 60000);
  
  // Clean up intervals on graceful shutdown
  process.on('SIGTERM', () => {
    clearInterval(scheduledNotifInterval);
  });
  process.on('SIGINT', () => {
    clearInterval(scheduledNotifInterval);
  });
}).catch((err) => {
  dbLogger.error({ err }, 'Failed to connect to MongoDB after all retries');
  logger.info('Server is still running. API endpoints requiring DB will return errors until MongoDB is available.');
});
 
export default app;