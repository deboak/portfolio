import crypto from 'node:crypto';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { apiRouter } from './routes.js';

export const createApp = () => {
  const app = express();
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(
    pinoHttp({
      autoLogging: env.NODE_ENV !== 'test',
      genReqId: (req, res) => {
        const id = req.headers['x-request-id']?.toString() ?? crypto.randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => callback(null, !origin || origin === env.WEB_ORIGIN),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buffer) => {
        (req as express.Request).rawBody = Buffer.from(buffer);
      },
    }),
  );
  app.use('/api/v1', apiRouter);
  app.use((_req, res) =>
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }),
  );
  app.use(errorHandler);
  return app;
};
