import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import healthRouter from './routes/health.js';
import mandisRouter from './routes/mandis.js';
import commoditiesRouter from './routes/commodities.js';
import pricesRouter from './routes/prices.js';
import transportersRouter from './routes/transporters.js';
import syncRouter from './routes/sync.js';
import adminRouter from './routes/admin.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Allow requests from the farmer PWA (5173) and admin panel (5174)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  process.env.ADMIN_ORIGIN || 'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl / Postman) and allowed origins
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Security headers; disable CSP restriction for API (no HTML served here)
app.use(helmet({ contentSecurityPolicy: false }));

// Compress JSON responses — important for 2G/3G payloads
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '2mb' }));

// HTTP request logging (skip in test env)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Public routes ---
app.use('/api/health', healthRouter);
app.use('/api/mandis', mandisRouter);
app.use('/api/commodities', commoditiesRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/transporters', transportersRouter);
app.use('/api/sync', syncRouter);

// --- Admin routes (JWT auth enforced per route) ---
app.use('/api/admin', adminRouter);

// 404 catch-all
app.use(notFound);

// Centralised error handling
app.use(errorHandler);

export default app;
