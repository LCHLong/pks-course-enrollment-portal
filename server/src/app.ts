import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const createApp = (): Application => {
  const app = express();

  // Global Middlewares
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck Route
  app.get('/health', (_req: Request, res: Response) => {
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
