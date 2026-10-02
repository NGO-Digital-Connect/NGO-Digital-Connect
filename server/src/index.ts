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
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        origin === FRONTEND_URL ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
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

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'NGO Digital Connect - Subscription API',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler for unknown routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 NGO Digital Connect API server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`⚡ Subscriptions: http://localhost:${PORT}/api/subscriptions/plans`);
  console.log(`💳 Webhook Endpoint: http://localhost:${PORT}/api/subscriptions/webhook`);
  console.log(`=======================================================`);
});
