import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import { configureCloudinary } from './config/cloudinary';
import routes from './routes';
import errorHandler from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
configureCloudinary();

// Connect to MongoDB
connectDB();

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});

export default app;
