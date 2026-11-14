import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/api.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // The Vite proxy makes requests same-origin; CORS only matters if the client calls :3001 directly.
  app.use(cors({ origin: config.clientOrigin }));
  // 100k characters of text can be several hundred KB once UTF-8 encoded.
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
