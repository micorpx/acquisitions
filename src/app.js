import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import securityMiddleware from './middleware/security.middleware.js';
import usersRoutes from './routes/users.routes.js';
import errorHandler from './middleware/errorHandler.js';
import correlationIdMiddleware from './middleware/correlationId.js';
import requestLogger from './middleware/requestLogger.js';
import { checkDbHealth } from './utils/dbHealth.js';

const app = express();

app.use(helmet());

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || false,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add correlation ID early in the middleware stack
app.use(correlationIdMiddleware);

// Add request logger
app.use(requestLogger);

// Keep morgan for combined HTTP logging
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.use(securityMiddleware);

app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions API endpoint');
  res.status(200).send('Hello, from Acquisitions API!');
});

app.get('/health', async (req, res) => {
  const dbHealth = await checkDbHealth();

  const status = {
    status: dbHealth.status === 'healthy' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: dbHealth,
    },
  };

  const httpStatus = dbHealth.status === 'healthy' ? 200 : 503;
  res.status(httpStatus).json(status);
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Acquisition API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Error handler (must be before 404)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

export default app;
