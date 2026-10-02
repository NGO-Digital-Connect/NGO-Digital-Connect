import type { Request, Response, NextFunction } from 'express';
import { SupabaseBackendService } from '../services/supabase.js';
import { type PlanTier, isPlanAtLeast, getPlans } from '../config/plans.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware: requireAuth
 * Extracts and verifies the Supabase access token (JWT) from Authorization header
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header. Please provide a valid Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Empty bearer token provided.' });
    return;
  }

  try {
    const user = await SupabaseBackendService.verifyAuthToken(token);
    if (!user || !user.id) {
      res.status(401).json({ error: 'Unauthorized: Invalid, expired, or revoked Supabase session token.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: (user as any).user_metadata?.role || (user as any).role,
    };

    next();
  } catch (err: any) {
    console.error('[requireAuth] Authentication error:', err.message);
    res.status(401).json({ error: 'Unauthorized: Session authentication failed.' });
  }
};

/**
 * Middleware: requirePlan
 * Enforces tier gating on protected premium endpoints.
 * Handles edge cases:
 * - Active subscriptions at or above minPlan
 * - Cancelled subscriptions where end_date is still in the future (grace access until cycle end)
 * - Downgrades / expired subscriptions
 */
export const requirePlan = (minPlan: PlanTier) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Unauthorized: Authentication required before checking plan permissions.' });
      return;
    }

    try {
      const sub = await SupabaseBackendService.getSubscriptionByUserId(req.user.id);
      const userPlan: PlanTier = sub?.plan || 'free';
      const status = sub?.status || 'active';

      // Check if plan tier satisfies requirement
      const tierSufficient = isPlanAtLeast(userPlan, minPlan);

      if (!tierSufficient) {
        const plans = getPlans();
        res.status(403).json({
          error: `Feature requires the ${plans[minPlan].name} plan or higher.`,
          requiredPlan: minPlan,
          currentPlan: userPlan,
          currentStatus: status,
          upgradeRequired: true,
        });
        return;
      }

      // Check status validity
      if (status === 'active' || status === 'authenticated') {
        next();
        return;
      }

      // Cancellation edge case: Retain access until cycle end_date
      if (status === 'cancelled' && sub?.end_date) {
        const now = new Date();
        const accessUntil = new Date(sub.end_date);
        if (accessUntil > now) {
          next();
          return;
        }
      }

      // Otherwise status is expired, halted, pending, or created
      res.status(403).json({
        error: `Your subscription is currently ${status}. Premium features are disabled until renewal or resolution.`,
        requiredPlan: minPlan,
        currentPlan: userPlan,
        currentStatus: status,
        upgradeRequired: true,
      });
    } catch (err: any) {
      console.error('[requirePlan] Error evaluating plan access:', err);
      res.status(500).json({ error: 'Internal server error while evaluating subscription access.' });
    }
  };
};
