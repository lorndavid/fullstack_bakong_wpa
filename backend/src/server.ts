import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import { configureCloudinary } from './config/cloudinary';
import routes from './routes';
import path from 'path';
import errorHandler from './middlewares/errorHandler';
import { startPaymentWatcher } from './services/paymentWatcher';
import { initSocket } from './services/socket';
import http from 'http';

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
configureCloudinary();

// Middlewares
app.use(cors({
  origin: [
    process.env.FRONTEND_USER_URL || 'http://localhost:5173',
    process.env.FRONTEND_ADMIN_URL || 'http://localhost:5174',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (local file storage fallback)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

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
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});

// Connect to MongoDB asynchronously (won't block server startup)
connectDB().then(() => {
  // Start the payment watcher once DB is connected
  startPaymentWatcher();
}).catch((err) => {
  console.error('Failed to connect to MongoDB after all retries:', err.message);
  console.log('Server is still running. API endpoints requiring DB will return errors until MongoDB is available.');
});

export default app;
