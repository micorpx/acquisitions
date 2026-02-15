import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.email().max(255).lowercase().trim(),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
  email: z.email().lowercase().trim(),
  password: z.string().min(1),
});
