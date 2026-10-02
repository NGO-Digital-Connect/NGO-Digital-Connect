import rateLimit from 'express-rate-limit';

/**
 * Standard subscription route limiter (e.g. creating/canceling subscriptions)
 * Prevents rapid automated abuse of Razorpay creation or checkout attempts.
 */
export const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many subscription requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Webhook specific limiter
 * High throughput to accommodate burst webhook deliveries from Razorpay.
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // accommodate burst webhook retries
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Webhook rate limit exceeded.',
  },
});
