import logger from './src/config/logger.js';
import jwtPkg from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key please change in PRODUCTION';
const JWT_EXPIRES_IN ='1d';

export const jwttoken = {
  sign: (payload) => {
    try {
      return jwtPkg.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
      logger.error('Failed to authenticate token', error);
      throw new Error('Failed to authenticate token');
    }
  },
  verify: (token) => {
    try {
      return jwtPkg.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Failed to authenticate token', error);
      throw new Error('Failed to authenticate token');
    }
  }
};