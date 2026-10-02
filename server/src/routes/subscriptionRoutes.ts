import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';
import { requireAuth, requirePlan } from '../middleware/auth.js';
import { subscriptionLimiter } from '../middleware/rateLimit.js';

export const subscriptionRouter = Router();

// Public Plan Listing
subscriptionRouter.get('/plans', SubscriptionController.getAvailablePlans);

// Authenticated User Current Subscription Status & Features
subscriptionRouter.get('/me', requireAuth, SubscriptionController.getCurrentUserSubscription);

// Create new Razorpay Subscription
subscriptionRouter.post('/create', subscriptionLimiter, requireAuth, SubscriptionController.createSubscription);

// Cancel current Razorpay Subscription at cycle end
subscriptionRouter.post('/cancel', subscriptionLimiter, requireAuth, SubscriptionController.cancelSubscription);

// Example Premium Gated Endpoints using requirePlan middleware
subscriptionRouter.get(
  '/features/ai-copilot-verify',
  requireAuth,
  requirePlan('pro'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Access granted to AI Copilot operations.',
      plan: req.user,
    });
  }
);

subscriptionRouter.get(
  '/features/csr-integrations-verify',
  requireAuth,
  requirePlan('enterprise'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Access granted to institutional CSR workspace.',
      plan: req.user,
    });
  }
);
