import logger from '../config/logger.js';
import { AppError } from '../errors/AppError.js';

const errorHandler = (err, req, res, next) => {
  // Create a child logger with correlation ID for this request
  const errorLogger = req.correlationId ? logger.child(req.correlationId) : logger;

  // Log the error
  errorLogger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    const response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      response.error.details = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors,
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Invalid token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Token expired',
      },
    });
  }

  // Handle database errors
  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT_ERROR',
        message: 'Resource already exists',
      },
    });
  }

  // Default to 500 for unknown errors
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
};

export default errorHandler;
