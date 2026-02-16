import app from './app.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 3000;

const gracefulShutdown = async signal => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close database connection after a timeout
  setTimeout(async () => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);

  try {
    // Import and close database pool if available
    // await db.end(); // If using neon/serverless, this may not be needed
    logger.info('Database connections closed');
  } catch (e) {
    logger.error('Error closing database connections:', e);
  }

  process.exit(0);
};

// Handle shutdown signals
const server = app.listen(PORT, () => {
  logger.info(`Listening on port http://localhost:${PORT}`);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export default server;
