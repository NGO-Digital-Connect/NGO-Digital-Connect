import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables from server/.env or root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import { subscriptionRouter } from './routes/subscriptionRoutes.js';
import { SubscriptionController } from './controllers/subscriptionController.js';
import { webhookLimiter } from './middleware/rateLimit.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. CORS Configuration
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        origin === FRONTEND_URL ||
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:3000' ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Razorpay-Signature', 'X-Razorpay-Event-Id'],
  })
);

// 2. CRITICAL: Mount Webhook route with express.raw() BEFORE express.json()
// This ensures that the exact cryptographic byte sequence is preserved for HMAC SHA-256 verification.
app.post(
  '/api/subscriptions/webhook',
  webhookLimiter,
  express.raw({ type: '*/*' }),
  SubscriptionController.handleWebhook
);

// 3. Mount JSON & URL-encoded body parsers for all standard API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API Routes
app.use('/api/subscriptions', subscriptionRouter);

// Direct Pricing endpoints & aliases
app.get('/api/pricing', SubscriptionController.getAvailablePlans);
app.get('/api/plans', SubscriptionController.getAvailablePlans);

// Health check and root endpoints
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'NGO Digital Connect - Subscription API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'NGO Digital Connect - Subscription API',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler for unknown routes
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[Unhandled Server Error]:', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
};
app.use(globalErrorHandler);

const startServer = (port: number) => {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 NGO Digital Connect API server running on port ${port}`);
    console.log(`🌐 Base URL: http://localhost:${port}`);
    console.log(`⚡ Subscriptions: http://localhost:${port}/api/subscriptions/plans`);
    console.log(`💳 Webhook Endpoint: http://localhost:${port}/api/subscriptions/webhook`);
    console.log(`=======================================================`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`[Server] Port ${port} is in use (e.g. macOS AirPlay). Retrying on port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('[Server Error]:', err);
    }
  });

  return server;
};

startServer(PORT);
