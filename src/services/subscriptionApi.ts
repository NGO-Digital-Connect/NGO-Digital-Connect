import type { PlanTier, SubscriptionPlan, UserSubscription } from '../types/subscription';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface CreateSubscriptionResponse {
  success: boolean;
  subscription_id: string;
  key_id: string;
  plan: PlanTier;
  planName: string;
  amount: number;
  currency: string;
  subscription: UserSubscription;
}

export interface GetMySubscriptionResponse {
  success: boolean;
  subscription: UserSubscription;
  effectivePlan: PlanTier;
  hasActivePaidSubscription: boolean;
  planConfig: SubscriptionPlan;
}

export const SubscriptionApi = {
  /**
   * Fetch all available subscription plans
   */
  getPlans: async (): Promise<{ plans: SubscriptionPlan[]; razorpayKeyId: string }> => {
    try {
      const res = await fetch(`${API_BASE}/subscriptions/plans`);
      if (!res.ok) {
        throw new Error(`Failed to fetch plans: ${res.statusText}`);
      }
      const data = await res.json();
      return {
        plans: data.plans,
        razorpayKeyId: data.razorpayKeyId,
      };
    } catch (err) {
      console.warn('[SubscriptionApi] Backend unreachable, using fallback plans:', err);
      // Sensible static fallback if backend is momentarily starting up
      return {
        plans: [
          {
            id: 'free',
            name: 'Free Starter',
            tagline: 'Essential presence for verified grassroots NGOs and community initiatives.',
            priceINR: 0,
            billingPeriod: 'monthly',
            hasRazorpayPlan: false,
            features: [
              'Verified NGO profile & public directory listing',
              'Standard case triage intake (up to 15 cases/month)',
              'Up to 3 active projects on ecosystem ledger',
              'Community volunteer drives (up to 20 volunteers/drive)',
              'Basic public platform analytics'
            ],
            flags: {
              aiCopilot: false,
              advancedAnalytics: false,
              csrIntegrations: false,
              advancedReports: false,
              prioritySupport: false,
            },
            limits: {
              casesPerMonth: 15,
              projectsLimit: 3,
              volunteersPerDrive: 20,
            },
          },
          {
            id: 'pro',
            name: 'NGO Pro',
            tagline: 'Autonomous AI operations, real-time analytics & 10x intake scaling.',
            priceINR: 1499,
            billingPeriod: 'monthly',
            hasRazorpayPlan: true,
            features: [
              'Everything in Free Starter',
              'AI Operations Copilot (smart triage, drafting & resource allocation)',
              'Multi-metric real-time impact analytics & trend forecasts',
              'High-capacity intake (up to 150 verified cases/month)',
              'Up to 25 concurrent social impact projects',
              'Automated skill-matched volunteer mobilizations',
              'Priority email & operational support'
            ],
            flags: {
              aiCopilot: true,
              advancedAnalytics: true,
              csrIntegrations: false,
              advancedReports: true,
              prioritySupport: true,
            },
            limits: {
              casesPerMonth: 150,
              projectsLimit: 25,
              volunteersPerDrive: 150,
            },
          },
          {
            id: 'enterprise',
            name: 'NGO Enterprise',
            tagline: 'Direct CSR institutional grant matching, multi-entity audits & unlimited scope.',
            priceINR: 4999,
            billingPeriod: 'monthly',
            hasRazorpayPlan: true,
            features: [
              'Everything in NGO Pro',
              'Direct Corporate CSR grant matching & co-funding workspace',
              'Schedule VII compliant audited impact utilization reports',
              'Government department synchronization & compliance ledger',
              'Unlimited monthly cases, projects & volunteer mobilization',
              'Custom beneficiary intake workflows & multi-branch coordination',
              'Dedicated impact success manager with 24/7 priority SLA'
            ],
            flags: {
              aiCopilot: true,
              advancedAnalytics: true,
              csrIntegrations: true,
              advancedReports: true,
              prioritySupport: true,
            },
            limits: {
              casesPerMonth: 999999,
              projectsLimit: 999999,
              volunteersPerDrive: 999999,
            },
          },
        ],
        razorpayKeyId: 'rzp_test_mock_key_id',
      };
    }
  },

  /**
   * Fetch current authenticated user's subscription
   */
  getMySubscription: async (token?: string): Promise<GetMySubscriptionResponse | null> => {
    if (!token) return null;

    const res = await fetch(`${API_BASE}/subscriptions/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  },

  /**
   * Create Razorpay subscription via backend
   */
  createSubscription: async (
    plan: PlanTier,
    token: string
  ): Promise<CreateSubscriptionResponse> => {
    const res = await fetch(`${API_BASE}/subscriptions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to initiate subscription');
    }

    return data;
  },

  /**
   * Cancel subscription at cycle end via backend
   */
  cancelSubscription: async (token: string): Promise<{ success: boolean; message: string; subscription: UserSubscription }> => {
    const res = await fetch(`${API_BASE}/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to cancel subscription');
    }

    return data;
  },
};
