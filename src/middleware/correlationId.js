import { randomUUID } from 'crypto';

/**
 * Middleware to generate and attach a correlation ID to each request.
 * This helps trace requests across logs and services.
 */
const correlationIdMiddleware = (req, res, next) => {
  // Check if request already has a correlation ID (from upstream service)
  req.correlationId = req.headers['x-correlation-id'] || randomUUID();

  // Attach to response headers for client visibility
  res.setHeader('X-Correlation-ID', req.correlationId);

  next();
};

export default correlationIdMiddleware;
