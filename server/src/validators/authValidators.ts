import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  timezone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  avatar: z.string().optional(),
});
