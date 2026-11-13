import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

export const createApp = () => {
  const app = express();

  // Cross-Origin Resource Sharing
  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-school-id']
  }));

  // JSON Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      platform: 'EduSaaS Multi-Tenant School Management Platform',
      version: '2.0.0'
    });
  });

  // Mount REST API
  app.use('/api', apiRouter);

  return app;
};
