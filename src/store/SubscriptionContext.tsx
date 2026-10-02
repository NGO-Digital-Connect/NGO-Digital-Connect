import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  PlanTier,
  SubscriptionStatus,
  SubscriptionPlan,
  UserSubscription,
  PlanFeatureDefinition,
  RazorpayOptions,
} from '../types/subscription';
import { SubscriptionApi } from '../services/subscriptionApi';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  currentPlan: PlanTier;
  status: SubscriptionStatus;
  availablePlans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  isProcessingPayment: boolean;
  paymentModalMessage: string | null;
  subscribe: (plan: PlanTier) => Promise<void>;
  cancel: () => Promise<void>;
  hasFeature: (feature: keyof PlanFeatureDefinition) => boolean;
  canAccess: (minPlan: PlanTier) => boolean;
  refreshSubscription: () => Promise<void>;
  dismissPaymentModal: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const PLAN_HIERARCHY: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

// Helper: Dynamically load Razorpay checkout script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise(resolve => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('[Razorpay] Failed to load checkout.js script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('free');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentModalMessage, setPaymentModalMessage] = useState<string | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('rzp_test_mock_key_id');

  const pollingRef = useRef<number | null>(null);

  // Helper to fetch session token
  const getAuthToken = useCallback(async (): Promise<string> => {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) return session.access_token;
      } catch (e) {
        console.warn('[SubscriptionContext] Error fetching session token:', e);
      }
    }
    // Fallback development token matching the active user ID
    return `demo-user-${currentUser.id}`;
  }, [currentUser.id]);

  // Load available plans on mount
  useEffect(() => {
    let isMounted = true;
    SubscriptionApi.getPlans()
      .then(res => {
        if (isMounted) {
          setAvailablePlans(res.plans);
          if (res.razorpayKeyId) setRazorpayKeyId(res.razorpayKeyId);
        }
      })
      .catch(err => {
        console.error('[SubscriptionContext] Error loading plans:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute effective plan considering cancellation grace period
  const computeEffectivePlan = (sub: UserSubscription | null): { plan: PlanTier; status: SubscriptionStatus } => {
    if (!sub) return { plan: 'free', status: 'active' };

    const now = new Date();
    if (sub.status === 'active' || sub.status === 'authenticated') {
      return { plan: sub.plan, status: sub.status };
    }

    if (sub.status === 'cancelled' && sub.end_date) {
      const endDate = new Date(sub.end_date);
      if (endDate > now) {
        // Keep access until cycle end
        return { plan: sub.plan, status: 'cancelled' };
      }
    }

    // Default to free Starter
    return { plan: 'free', status: sub.status };
  };

  // Fetch current user subscription
  const refreshSubscription = useCallback(async () => {
    if (!currentUser.id) return;
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const res = await SubscriptionApi.getMySubscription(token);

      if (res && res.subscription) {
        setSubscription(res.subscription);
        const resolved = computeEffectivePlan(res.subscription);
        setCurrentPlan(resolved.plan);
        setStatus(resolved.status);
      } else {
        // Fallback default free subscription
        setCurrentPlan('free');
        setStatus('active');
      }
    } catch (err: unknown) {
      console.warn('[SubscriptionContext] Notice fetching subscription:', (err as Error)?.message);
      // Gracefully maintain free access on connection hiccup
      setCurrentPlan(prev => prev || 'free');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, getAuthToken]);

  useEffect(() => {
    let isCancelled = false;

    const initializeSubscription = async () => {
      if (!currentUser.id) return;
      try {
        const token = await getAuthToken();
        const res = await SubscriptionApi.getMySubscription(token);
        if (!isCancelled) {
          if (res && res.subscription) {
            setSubscription(res.subscription);
            const resolved = computeEffectivePlan(res.subscription);
            setCurrentPlan(resolved.plan);
            setStatus(resolved.status);
          } else {
            setCurrentPlan('free');
            setStatus('active');
          }
        }
      } catch (err: unknown) {
        console.warn('[SubscriptionContext] Initial load notice:', (err as Error)?.message);
        if (!isCancelled) {
          setCurrentPlan(prev => prev || 'free');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeSubscription();

    return () => {
      isCancelled = true;
    };
  }, [currentUser.id, getAuthToken]);

  // Supabase Realtime subscription to reflect external webhook changes instantly
  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser.id) return;

    const channel = supabase
      .channel(`subscription_live_${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${currentUser.id}`,
        },
        payload => {
          console.log('[Subscription Realtime] Event received:', payload.eventType);
          if (payload.new) {
            const updated = payload.new as UserSubscription;
            setSubscription(updated);
            const resolved = computeEffectivePlan(updated);
            setCurrentPlan(resolved.plan);
            setStatus(resolved.status);

            // If we were waiting in "Processing payment...", stop and celebrate!
            if (updated.status === 'active') {
              setIsProcessingPayment(false);
              setPaymentModalMessage(null);
              if (pollingRef.current) {
                window.clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Poll GET /api/subscriptions/me until webhook updates DB
  const startPaymentVerificationPolling = useCallback(async (targetPlan: PlanTier) => {
    setIsProcessingPayment(true);
    setPaymentModalMessage('Verifying payment with secure Razorpay Webhook. Your tier will activate automatically...');

    let attempts = 0;
    const maxAttempts = 20; // 20 * 1500ms = 30 seconds

    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
    }

    pollingRef.current = window.setInterval(async () => {
      attempts++;
      try {
        const token = await getAuthToken();
        const res = await SubscriptionApi.getMySubscription(token);

        if (res?.subscription?.status === 'active' || res?.effectivePlan === targetPlan) {
          if (pollingRef.current) {
            window.clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setSubscription(res.subscription);
          setCurrentPlan(res.effectivePlan);
          setStatus(res.subscription.status);
          setIsProcessingPayment(false);
          setPaymentModalMessage(null);
          return;
        }
      } catch (e) {
        console.warn('[Polling] Verification attempt error:', e);
      }

      if (attempts >= maxAttempts) {
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setIsProcessingPayment(false);
        setPaymentModalMessage(
          'Payment submitted! The webhook confirmation is taking longer than usual. Your account will update momentarily.'
        );
      }
    }, 1500);
  }, [getAuthToken]);

  // Subscribe flow
  const subscribe = async (plan: PlanTier) => {
    if (plan === 'free') {
      return;
    }

    setError(null);
    try {
      const token = await getAuthToken();
      // 1. Request subscription from backend
      const res = await SubscriptionApi.createSubscription(plan, token);

      // 2. Load Razorpay Checkout Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK could not be loaded. Check your internet connection.');
      }

      // 3. Launch Razorpay Checkout Modal
      const options: RazorpayOptions = {
        key: res.key_id || razorpayKeyId,
        subscription_id: res.subscription_id,
        name: 'NGO Digital Connect',
        description: `${res.planName} Platform Subscription`,
        image: 'https://cdn-icons-png.flaticon.com/512/2913/2913584.png',
        handler: (checkoutRes) => {
          console.log('[Razorpay Checkout Success Handler] Checkout response:', checkoutRes);
          // CRITICAL: The frontend NEVER decides payment succeeded on its own.
          // Show "Processing payment..." and poll backend/listen to webhook.
          startPaymentVerificationPolling(plan);
        },
        prefill: {
          name: currentUser.profile.name,
          email: currentUser.email,
          contact: currentUser.profile.phone || '',
        },
        notes: {
          user_id: currentUser.id,
          requested_tier: plan,
        },
        theme: {
          color: '#2563eb', // Primary brand color
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay Checkout] User dismissed modal.');
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err: unknown) {
      console.error('[subscribe] Failed:', err);
      const errMsg = (err as Error)?.message || 'Failed to start subscription process.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    }
  };

  // Cancel flow
  const cancel = async () => {
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await SubscriptionApi.cancelSubscription(token);
      if (res.subscription) {
        setSubscription(res.subscription);
        const resolved = computeEffectivePlan(res.subscription);
        setCurrentPlan(resolved.plan);
        setStatus(resolved.status);
      }
    } catch (err: unknown) {
      console.error('[cancel] Failed:', err);
      const errMsg = (err as Error)?.message || 'Failed to cancel subscription.';
      setError(errMsg);
      throw new Error(errMsg, { cause: err });
    }
  };

  // Feature flag check
  const hasFeature = useCallback(
    (feature: keyof PlanFeatureDefinition): boolean => {
      const planConfig = availablePlans.find(p => p.id === currentPlan);
      return Boolean(planConfig?.flags?.[feature]);
    },
    [availablePlans, currentPlan]
  );

  // Minimum plan tier check
  const canAccess = useCallback(
    (minPlan: PlanTier): boolean => {
      const userRank = PLAN_HIERARCHY[currentPlan] ?? 0;
      const targetRank = PLAN_HIERARCHY[minPlan] ?? 0;
      return userRank >= targetRank;
    },
    [currentPlan]
  );

  const dismissPaymentModal = () => {
    setIsProcessingPayment(false);
    setPaymentModalMessage(null);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        currentPlan,
        status,
        availablePlans,
        isLoading,
        error,
        isProcessingPayment,
        paymentModalMessage,
        subscribe,
        cancel,
        hasFeature,
        canAccess,
        refreshSubscription,
        dismissPaymentModal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
