import { signUpSchema, signInSchema } from '#validations/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';
import logger from '#config/logger.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';
// import { de, id } from "zod/locales";

export const signUp = async(req, res, next) => {
  try {

    const validationResult = signUpSchema.safeParse(req.body);
        
    if(!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation Failed',
        details: formatValidationErrors(validationResult.error)
      });
    }
    const {name, email, password, role} = validationResult.data;

    const user = await createUser({name, email, password, role});

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);



    // AUTH SERVICE call simulation
    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ 
      message: 'User registered successfully' ,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role
      }
    });

  } catch (e) {
    logger.error('Error in signUp:', e);

    if(e.message === 'User already exists') {
      return res.status(409).json({ error: 'Email already exists' });

    } 
    next(e);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
        
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationErrors(validationResult.error)
      });
    }
        
    const { email, password } = validationResult.data;
        
    const user = await authenticateUser({ email, password });
        
    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);
        
    logger.info(`User signed in successfully: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
        
  } catch (e) {
    logger.error('Error in signIn:', e);
        
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
        
    if (e.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
        
    next(e);
  }
};

export const signOut = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');
        
    logger.info('User signed out successfully');
    res.status(200).json({
      message: 'User signed out successfully'
    });
        
  } catch (e) {
    logger.error('Error in signOut:', e);
    next(e);
  }
};
