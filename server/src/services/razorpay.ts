import Razorpay from 'razorpay';
import crypto from 'node:crypto';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export const isRazorpayLiveConfigured = Boolean(
  keyId &&
  keySecret &&
  !keyId.includes('your_razorpay') &&
  !keySecret.includes('your_razorpay') &&
  !keyId.includes('sample') &&
  !keySecret.includes('sample')
);

if (!isRazorpayLiveConfigured) {
  console.warn(
    '[Razorpay Service] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured or using placeholders. ' +
    'Simulated test subscriptions will be generated for seamless local development until live API keys are provided.'
  );
}

// Razorpay SDK instance
let razorpayClient: any = null;
if (isRazorpayLiveConfigured) {
  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export const RazorpayService = {
  getKeyId: (): string => {
    return keyId || 'rzp_test_mock_key_id';
  },

  /**
   * Create a recurring subscription on Razorpay
   */
  createSubscription: async (params: {
    planId: string;
    userId: string;
    userEmail: string;
    totalCount?: number;
    notes?: Record<string, string>;
  }): Promise<{ id: string; status: string; current_start?: number; current_end?: number }> => {
    if (isRazorpayLiveConfigured && razorpayClient) {
      try {
        const response = await razorpayClient.subscriptions.create({
          plan_id: params.planId,
          total_count: params.totalCount || 120, // 10 years monthly by default
          quantity: 1,
          customer_notify: 1,
          notes: {
            user_id: params.userId,
            user_email: params.userEmail,
            platform: 'NGO Digital Connect',
            ...(params.notes || {}),
          },
        });
        return response;
      } catch (err: any) {
        console.error('[RazorpayService] Error creating Razorpay subscription:', err);
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[RazorpayService] Dev fallback: Razorpay API rejected credentials or plan ID. Generating mock subscription for local testing.');
          const mockId = `sub_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const nowSec = Math.floor(Date.now() / 1000);
          return {
            id: mockId,
            status: 'created',
            current_start: nowSec,
            current_end: nowSec + 30 * 86400,
          };
        }
        throw new Error(err?.error?.description || err.message || 'Razorpay subscription creation failed');
      }
    }

    // Mock response for local development when credentials are not yet supplied
    const mockId = `sub_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowSec = Math.floor(Date.now() / 1000);
    return {
      id: mockId,
      status: 'created',
      current_start: nowSec,
      current_end: nowSec + 30 * 86400,
    };
  },

  /**
   * Cancel an active Razorpay subscription
   */
  cancelSubscription: async (
    subscriptionId: string,
    cancelAtCycleEnd = true
  ): Promise<{ id: string; status: string; ended_at?: number }> => {
    if (isRazorpayLiveConfigured && razorpayClient) {
      try {
        const response = await razorpayClient.subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
        return response;
      } catch (err: any) {
        console.error('[RazorpayService] Error canceling Razorpay subscription:', err);
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[RazorpayService] Dev fallback: Returning mock subscription cancellation.');
          return {
            id: subscriptionId,
            status: 'cancelled',
            ended_at: Math.floor(Date.now() / 1000) + 30 * 86400,
          };
        }
        throw new Error(err?.error?.description || err.message || 'Razorpay cancellation failed');
      }
    }

    return {
      id: subscriptionId,
      status: 'cancelled',
      ended_at: Math.floor(Date.now() / 1000) + 30 * 86400,
    };
  },

  /**
   * Fetch current details of a subscription from Razorpay
   */
  fetchSubscription: async (subscriptionId: string): Promise<any> => {
    if (isRazorpayLiveConfigured && razorpayClient) {
      return await razorpayClient.subscriptions.fetch(subscriptionId);
    }

    const nowSec = Math.floor(Date.now() / 1000);
    return {
      id: subscriptionId,
      status: 'active',
      current_start: nowSec,
      current_end: nowSec + 30 * 86400,
    };
  },

  /**
   * Timing-safe verification of the Razorpay Webhook signature
   */
  verifyWebhookSignature: (
    rawBody: string | Buffer,
    signature: string | undefined | null,
    secretOverride?: string
  ): boolean => {
    const secret = secretOverride || process.env.RAZORPAY_WEBHOOK_SECRET || webhookSecret;
    if (!signature || !secret) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(rawBody);
      const expectedSignature = hmac.digest('hex');

      // Use crypto.timingSafeEqual to prevent timing attacks
      const signatureBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (err) {
      console.error('[RazorpayService] Signature verification exception:', err);
      return false;
    }
  },
};
