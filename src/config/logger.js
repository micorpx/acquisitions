import winston from 'winston';

const createLogger = (correlationId = null) => {
  const formats = [
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
  ];

  // Add correlation ID if provided
  if (correlationId) {
    formats.push(winston.format.metadata({ key: 'correlationId', value: correlationId }));
  }

  // Use JSON format in production, simple format in development
  if (process.env.NODE_ENV === 'production') {
    formats.push(winston.format.json());
  } else {
    formats.push(
      winston.format.colorize(),
      winston.format.simple()
    );
  }

  const transports = [
    new winston.transports.Console(),
  ];

  // Add file transports only in non-production
  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(...formats),
    defaultMeta: { service: 'acquisitions-api' },
    transports,
  });
};

// Create a singleton logger instance
const logger = createLogger();

export default logger;

// Export a method to create child loggers with correlation ID
logger.child = (correlationId) => createLogger(correlationId);
