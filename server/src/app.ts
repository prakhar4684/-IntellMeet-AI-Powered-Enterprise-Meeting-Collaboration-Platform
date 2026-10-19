import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import meetingRoutes from './routes/meetingRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import taskRoutes from './routes/taskRoutes';
import aiRoutes from './routes/aiRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';

export const createApp = (): Application => {
  const app = express();

  // Security Headers & CORS
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    })
  );

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', apiLimiter);

  // Logging & Parsing
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health Endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'IntellMeet Backend API', timestamp: new Date() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/meetings', meetingRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
