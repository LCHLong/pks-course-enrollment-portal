import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const createApp = (): Application => {
  const app = express();

  // Global Middlewares
  const allowedClient = process.env.CLIENT_URL;
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin) return callback(null, true);
      if (
        !allowedClient ||
        allowedClient === '*' ||
        origin === allowedClient ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root & Healthcheck Routes (Supports direct checks & monitoring)
  app.get(['/', '/health', '/api/health'], (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'PKS Course & Enrollment Portal API',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Ho_Chi_Minh',
    });
  });

  // RESTful API Routes
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
