import type { Request, Response } from 'express';
import { getPlans, type PlanTier } from '../config/plans.js';
import { RazorpayService } from '../services/razorpay.js';
import { SupabaseBackendService } from '../services/supabase.js';

export const SubscriptionController = {
  /**
   * GET /api/subscriptions/plans
   * Returns list of available subscription tiers, pricing, and feature definitions
   */
  getAvailablePlans: async (_req: Request, res: Response): Promise<void> => {
    try {
      const plans = getPlans();
      // Expose plans to public without sensitive internal details
      const publicPlans = Object.values(plans).map(plan => ({
        id: plan.id,
        name: plan.name,
        tagline: plan.tagline,
        priceINR: plan.priceINR,
        billingPeriod: plan.billingPeriod,
        hasRazorpayPlan: Boolean(plan.razorpayPlanId),
        features: plan.features,
        flags: plan.flags,
        limits: plan.limits,
      }));

      res.json({
        success: true,
        plans: publicPlans,
        razorpayKeyId: RazorpayService.getKeyId(),
      });
    } catch (err: unknown) {
      console.error('[getAvailablePlans] Error:', err);
      res.status(500).json({ error: 'Failed to retrieve subscription plans.' });
    }
  },

  /**
   * GET /api/subscriptions/me
   * Returns the current authenticated user's authoritative subscription status & features
   */
  getCurrentUserSubscription: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
        return;
      }

      let sub = await SupabaseBackendService.getSubscriptionByUserId(userId);
      const plans = getPlans();

      // If user does not have a row in subscriptions yet, auto-provision the default Free row
      if (!sub) {
        sub = await SupabaseBackendService.upsertSubscription({
          userId,
          plan: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
        });
      }

      // Evaluate effective active tier considering status and cancellation grace period
      let effectivePlan: PlanTier = 'free';
      let hasActivePaidSubscription = false;
      const now = new Date();

      if (sub.status === 'active' || sub.status === 'authenticated') {
        effectivePlan = sub.plan;
        hasActivePaidSubscription = sub.plan !== 'free';
      } else if (sub.status === 'cancelled' && sub.end_date) {
        const endDate = new Date(sub.end_date);
        if (endDate > now) {
          // Grace period active until end of billing cycle
          effectivePlan = sub.plan;
          hasActivePaidSubscription = true;
        }
      }

      res.json({
        success: true,
        subscription: sub,
        effectivePlan,
        hasActivePaidSubscription,
        planConfig: plans[effectivePlan],
      });
    } catch (err: unknown) {
      console.error('[getCurrentUserSubscription] Error:', err);
      res.status(500).json({ error: 'Failed to fetch user subscription details.' });
    }
  },

  /**
   * POST /api/subscriptions/create
   * Initiates a Razorpay subscription and saves a pending 'created' record in Supabase
   */
  createSubscription: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email || '';
      const { plan } = req.body as { plan?: PlanTier };

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      if (!plan || (plan !== 'pro' && plan !== 'enterprise')) {
        res.status(400).json({
          error: "Invalid plan selected. Only 'pro' and 'enterprise' require payment.",
        });
        return;
      }

      const plans = getPlans();
      const targetPlanConfig = plans[plan];

      if (!targetPlanConfig) {
        res.status(400).json({ error: 'Plan configuration not found.' });
        return;
      }

      const razorpayPlanId = targetPlanConfig.razorpayPlanId;
      if (!razorpayPlanId && process.env.NODE_ENV === 'production') {
        res.status(500).json({
          error: `Razorpay Plan ID for tier '${plan}' is not configured on the server.`,
        });
        return;
      }

      // Check current subscription
      const currentSub = await SupabaseBackendService.getSubscriptionByUserId(userId);

      // Edge case: If user already has an active subscription for this exact plan
      if (currentSub?.plan === plan && currentSub.status === 'active') {
        res.status(400).json({
          error: `You are already actively subscribed to the ${targetPlanConfig.name} plan.`,
          subscription: currentSub,
        });
        return;
      }

      // Create Razorpay Subscription via SDK
      const razorpaySub = await RazorpayService.createSubscription({
        planId: razorpayPlanId || `mock_plan_${plan}`,
        userId,
        userEmail,
        notes: {
          requested_tier: plan,
        },
      });

      // Save row in Supabase with status 'created'
      // Note: Premium access is NOT granted yet until the webhook verifies payment.
      const savedSub = await SupabaseBackendService.upsertSubscription({
        userId,
        plan,
        status: 'created',
        razorpaySubscriptionId: razorpaySub.id,
        startDate: razorpaySub.current_start
          ? new Date(razorpaySub.current_start * 1000).toISOString()
          : new Date().toISOString(),
        endDate: razorpaySub.current_end
          ? new Date(razorpaySub.current_end * 1000).toISOString()
          : null,
      });

      res.status(201).json({
        success: true,
        subscription_id: razorpaySub.id,
        key_id: RazorpayService.getKeyId(),
        plan,
        planName: targetPlanConfig.name,
        amount: targetPlanConfig.priceINR * 100, // in paise for display if needed
        currency: 'INR',
        subscription: savedSub,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate subscription.';
      console.error('[createSubscription] Error:', message);
      res.status(500).json({ error: message });
    }
  },

  /**
   * POST /api/subscriptions/cancel
   * Cancels user's active Razorpay subscription at the end of the current billing cycle
   */
  cancelSubscription: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const sub = await SupabaseBackendService.getSubscriptionByUserId(userId);
      if (!sub || sub.plan === 'free' || !sub.razorpay_subscription_id) {
        res.status(400).json({ error: 'No active paid subscription found to cancel.' });
        return;
      }

      if (sub.status === 'cancelled') {
        res.status(400).json({
          error: 'Subscription has already been scheduled for cancellation.',
          subscription: sub,
        });
        return;
      }

      // Cancel at period end via Razorpay API
      const cancelResponse = await RazorpayService.cancelSubscription(
        sub.razorpay_subscription_id,
        true // cancel at cycle end
      );

      // Update Supabase record to 'cancelled', retaining access until end_date
      const updatedSub = await SupabaseBackendService.upsertSubscription({
        userId,
        plan: sub.plan,
        status: 'cancelled',
        razorpaySubscriptionId: sub.razorpay_subscription_id,
        endDate: cancelResponse.ended_at
          ? new Date(cancelResponse.ended_at * 1000).toISOString()
          : sub.end_date,
      });

      res.json({
        success: true,
        message: 'Subscription successfully cancelled. You will maintain access until the end of your current billing period.',
        subscription: updatedSub,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription.';
      console.error('[cancelSubscription] Error:', message);
      res.status(500).json({ error: message });
    }
  },

  /**
   * POST /api/subscriptions/webhook
   * Razorpay Webhook Endpoint
   * Verifies signature, processes subscription events, provides idempotency, and updates Supabase.
   */
  handleWebhook: async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const eventIdHeader = req.headers['x-razorpay-event-id'] as string | undefined;

    // Raw body buffer is provided by express.raw()
    const rawBodyBuffer = req.body as Buffer;
    if (!rawBodyBuffer || !Buffer.isBuffer(rawBodyBuffer)) {
      console.error('[Webhook] Missing raw body buffer.');
      res.status(400).json({ error: 'Invalid payload: Raw body missing.' });
      return;
    }

    // 1. Timing-safe Signature Verification
    const isValidSignature = RazorpayService.verifyWebhookSignature(rawBodyBuffer, signature);
    if (!isValidSignature) {
      console.warn('[Webhook] Invalid Razorpay webhook signature attempt.');
      res.status(400).json({ error: 'Invalid webhook signature.' });
      return;
    }

    // 2. Parse JSON payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBodyBuffer.toString('utf8'));
    } catch (err) {
      console.error('[Webhook] JSON parse failure:', err);
      res.status(400).json({ error: 'Malformed JSON payload.' });
      return;
    }

    const eventId = eventIdHeader || payload.event_id || payload.id;
    const eventType = payload.event;

    if (!eventId || !eventType) {
      console.warn('[Webhook] Missing event id or event type in payload.');
      res.status(400).json({ error: 'Missing event metadata.' });
      return;
    }

    console.log(`[Webhook] Received Razorpay event: "${eventType}" [ID: ${eventId}]`);

    // 3. Idempotency Check
    const alreadyProcessed = await SupabaseBackendService.isEventProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`[Webhook] Event ${eventId} was already processed. Acknowledging with 200.`);
      res.status(200).json({ status: 'already_processed', event_id: eventId });
      return;
    }

    try {
      // 4. Extract Subscription & Payment entities
      const subEntity = payload?.payload?.subscription?.entity;
      const paymentEntity = payload?.payload?.payment?.entity;
      const razorpaySubId = subEntity?.id || paymentEntity?.subscription_id;

      if (razorpaySubId) {
        const customerId = subEntity?.customer_id || paymentEntity?.customer_id || null;
        const currentStart = subEntity?.current_start
          ? new Date(subEntity.current_start * 1000).toISOString()
          : undefined;
        const currentEnd = subEntity?.current_end
          ? new Date(subEntity.current_end * 1000).toISOString()
          : undefined;

        const userIdFromNotes = subEntity?.notes?.user_id || paymentEntity?.notes?.user_id;
        const tierFromNotes = (subEntity?.notes?.tier || subEntity?.notes?.requested_tier || subEntity?.notes?.plan) as PlanTier | undefined;

        switch (eventType) {
          case 'subscription.authenticated':
            await SupabaseBackendService.updateSubscriptionByRazorpayId(razorpaySubId, {
              status: 'authenticated',
              razorpayCustomerId: customerId,
              startDate: currentStart,
              endDate: currentEnd,
              userId: userIdFromNotes,
              plan: tierFromNotes,
            });
            break;

          case 'subscription.activated':
          case 'subscription.charged':
            await SupabaseBackendService.updateSubscriptionByRazorpayId(razorpaySubId, {
              status: 'active',
              razorpayCustomerId: customerId,
              startDate: currentStart,
              endDate: currentEnd,
              userId: userIdFromNotes,
              plan: tierFromNotes,
            });
            break;

          case 'subscription.pending':
            await SupabaseBackendService.updateSubscriptionByRazorpayId(razorpaySubId, {
              status: 'pending',
              endDate: currentEnd,
              userId: userIdFromNotes,
            });
            break;

          case 'subscription.halted':
            // Payment retries exhausted: subscription is halted
            await SupabaseBackendService.updateSubscriptionByRazorpayId(razorpaySubId, {
              status: 'halted',
              endDate: currentEnd,
              userId: userIdFromNotes,
            });
            break;

          case 'subscription.cancelled':
            await SupabaseBackendService.updateSubscriptionByRazorpayId(razorpaySubId, {
              status: 'cancelled',
              endDate: currentEnd,
              userId: userIdFromNotes,
            });
            break;

          case 'subscription.completed':
            await SupabaseBackendService.updateSubscriptionByRazorpayId(razorpaySubId, {
              status: 'completed',
              endDate: currentEnd,
            });
            break;

          case 'payment.failed':
            // Log payment failure; mark pending or halted if associated with a subscription
            console.warn(`[Webhook] Payment failed for subscription ${razorpaySubId}`);
            await SupabaseBackendService.updateSubscriptionByRazorpayId(razorpaySubId, {
              status: 'pending',
            });
            break;

          default:
            console.log(`[Webhook] Unhandled event type: ${eventType}`);
            break;
        }
      } else {
        console.warn(`[Webhook] No subscription entity found in event payload: ${eventType}`);
      }

      // 5. Record event in payment_events table for idempotency & audit trail
      await SupabaseBackendService.recordPaymentEvent(eventId, eventType, payload);

      // Return 200 OK immediately
      res.status(200).json({ status: 'success', event_id: eventId });
    } catch (err: unknown) {
      // Log errors without leaking sensitive credentials
      const message = err instanceof Error ? err.message : 'Unknown processing error';
      console.error('[Webhook Processing Error]:', message);
      // Return 200 to acknowledge webhook if error was internal DB so Razorpay does not endlessly storm retries,
      // or return 500 if retry is desired. Razorpay docs recommend 200 once signature is valid unless transient error.
      res.status(200).json({ status: 'error_logged', message: 'Internal processing logged' });
    }
  },
};
