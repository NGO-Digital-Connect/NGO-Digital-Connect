export type PlanTier = 'free' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'pending'
  | 'halted'
  | 'cancelled'
  | 'completed'
  | 'expired';

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
  hasRazorpayPlan: boolean;
  features: string[];
  flags: PlanFeatureDefinition;
  limits: PlanLimits;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: PlanTier;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RazorpayCheckoutResponse {
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpayCheckoutResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}
