import { sql } from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Check database connectivity and health.
 * @returns {Promise<{status: 'healthy' | 'unhealthy', latency?: number, error?: string}>}
 */
export const checkDbHealth = async () => {
  const start = Date.now();
  try {
    const result = await sql('SELECT 1 as check');
    const latency = Date.now() - start;

    if (result.rows[0]?.check === 1) {
      return {
        status: 'healthy',
        latency,
      };
    }

    return {
      status: 'unhealthy',
      latency,
      error: 'Database check returned unexpected result',
    };
  } catch (e) {
    logger.error('Database health check failed:', e);
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: e.message,
    };
  }
};
