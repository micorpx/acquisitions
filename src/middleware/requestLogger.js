import logger from '../config/logger.js';

/**
 * Middleware to log incoming requests and outgoing responses.
 * Uses the correlation ID for request tracing.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const correlationId = req.correlationId;

  // Log request
  logger.info('Incoming request', {
    correlationId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

export default requestLogger;
