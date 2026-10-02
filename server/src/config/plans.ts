export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface PlanFeatureDefinition {
  aiCopilot: boolean;
  advancedAnalytics: boolean;
  csrIntegrations: boolean;
  advancedReports: boolean;
  prioritySupport: boolean;
}

export interface PlanLimits {
  casesPerMonth: number;
  projectsLimit: number;
  volunteersPerDrive: number;
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  priceINR: number;
  billingPeriod: 'monthly';
  razorpayPlanId: string | null;
  features: string[];
  flags: PlanFeatureDefinition;
  limits: PlanLimits;
}

export const PLAN_HIERARCHY: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

export const isPlanAtLeast = (userPlan: PlanTier, minPlan: PlanTier): boolean => {
  const userRank = PLAN_HIERARCHY[userPlan] ?? 0;
  const targetRank = PLAN_HIERARCHY[minPlan] ?? 0;
  return userRank >= targetRank;
};

export const getPlans = (): Record<PlanTier, SubscriptionPlan> => {
  return {
    free: {
      id: 'free',
      name: 'Free Starter',
      tagline: 'Essential presence for verified grassroots NGOs and community initiatives.',
      priceINR: 0,
      billingPeriod: 'monthly',
      razorpayPlanId: null,
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
    pro: {
      id: 'pro',
      name: 'NGO Pro',
      tagline: 'Autonomous AI operations, real-time analytics & 10x intake scaling.',
      priceINR: 1499,
      billingPeriod: 'monthly',
      razorpayPlanId: process.env.RAZORPAY_PLAN_ID_PRO || '',
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
    enterprise: {
      id: 'enterprise',
      name: 'NGO Enterprise',
      tagline: 'Direct CSR institutional grant matching, multi-entity audits & unlimited scope.',
      priceINR: 4999,
      billingPeriod: 'monthly',
      razorpayPlanId: process.env.RAZORPAY_PLAN_ID_ENTERPRISE || '',
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
  };
};
