import logger from '../config/logger.js';
import jwtPkg from 'jsonwebtoken';

const JWT_EXPIRES_IN = '15m';
const isTestEnv = process.env.NODE_ENV === 'test';
const JWT_SECRET = process.env.JWT_SECRET || (isTestEnv ? 'ci-test-jwt-secret' : undefined);

// Validate JWT_SECRET at load time for non-test environments.
if (!JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is required');
  throw new Error('JWT_SECRET environment variable is required');
}

export const jwttoken = {
  sign: payload => {
    try {
      return jwtPkg.sign(payload, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRES_IN,
      });
    } catch (error) {
      logger.error('Failed to sign JWT token', error);
      throw new Error('Failed to sign JWT token');
    }
  },
  verify: token => {
    try {
      return jwtPkg.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      logger.error('Failed to verify JWT token', error);
      throw new Error('Failed to authenticate token');
    }
  },
};
