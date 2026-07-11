import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, { message: string }>;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let fieldErrors: Record<string, string> | undefined;

  // Mongoose duplicate key error
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}. This ${field} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    fieldErrors = {};
    for (const [key, val] of Object.entries(err.errors)) {
      fieldErrors[key] = val.message;
    }
    message = 'Validation failed';
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Multer file size error
  if (err.message === 'File too large') {
    statusCode = 400;
    message = 'File size exceeds 5MB limit';
  }

  // Log the error with correlation ID for debugging
  const requestId = (req as any).id;
  const reqLog = (req as any).log;
  if (reqLog) {
    reqLog.error({ err, statusCode }, message);
  }

  sendError(res, message, statusCode, fieldErrors, {
    ...(requestId && { requestId }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
