import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { PlanTier } from '../config/plans.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[Supabase Server] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment. ' +
    'Database updates will run in mock/local fallback mode until valid credentials are provided.'
  );
}

// Service role client bypasses RLS for authoritative server-side writes
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface DbSubscription {
  id: string;
  user_id: string;
  plan: PlanTier;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  status: 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired';
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// In-memory fallback cache for development/demo when Supabase credentials are not yet configured
const memorySubscriptions = new Map<string, DbSubscription>();
const memoryEvents = new Set<string>();

export const SupabaseBackendService = {
  /**
   * Verify an incoming Supabase access token (JWT) from Authorization header
   */
  verifyAuthToken: async (token: string) => {
    // Development / persona-switcher mock token support
    if (token.startsWith('demo-user-') || token === 'demo-token') {
      const userId = token.replace('demo-user-', '') || 'demo-admin-id';
      return {
        id: userId,
        email: 'admin@ngoconnect.org',
        role: 'ADMIN',
      };
    }

    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return null;
      }
      return user;
    } catch (err) {
      console.error('[SupabaseBackendService] Token verification error:', err);
      return null;
    }
  },

  /**
   * Fetch a user's subscription record by user_id
   */
  getSubscriptionByUserId: async (userId: string): Promise<DbSubscription | null> => {
    if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-service-key') {
      return memorySubscriptions.get(userId) || null;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[SupabaseBackendService] Error fetching subscription for user:', userId, error.message);
        return memorySubscriptions.get(userId) || null;
      }

      return data as DbSubscription | null;
    } catch (err) {
      console.error('[SupabaseBackendService] Exception in getSubscriptionByUserId:', err);
      return memorySubscriptions.get(userId) || null;
    }
  },

  /**
   * Fetch a subscription record by razorpay_subscription_id
   */
  getSubscriptionByRazorpayId: async (razorpaySubId: string): Promise<DbSubscription | null> => {
    if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-service-key') {
      for (const sub of memorySubscriptions.values()) {
        if (sub.razorpay_subscription_id === razorpaySubId) return sub;
      }
      return null;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('razorpay_subscription_id', razorpaySubId)
        .maybeSingle();

      if (error) {
        console.error('[SupabaseBackendService] Error fetching subscription by razorpay_sub_id:', razorpaySubId, error.message);
        return null;
      }

      return data as DbSubscription | null;
    } catch (err) {
      console.error('[SupabaseBackendService] Exception in getSubscriptionByRazorpayId:', err);
      return null;
    }
  },

  /**
   * Create or update a subscription record
   */
  upsertSubscription: async (params: {
    userId: string;
    plan: PlanTier;
    status: DbSubscription['status'];
    razorpaySubscriptionId?: string | null;
    razorpayCustomerId?: string | null;
    startDate?: string;
    endDate?: string | null;
  }): Promise<DbSubscription> => {
    const payload: Partial<DbSubscription> = {
      user_id: params.userId,
      plan: params.plan,
      status: params.status,
      razorpay_subscription_id: params.razorpaySubscriptionId || null,
      razorpay_customer_id: params.razorpayCustomerId || null,
      start_date: params.startDate || new Date().toISOString(),
      end_date: params.endDate || null,
      updated_at: new Date().toISOString(),
    };

    if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-service-key') {
      const existing = memorySubscriptions.get(params.userId);
      const updated: DbSubscription = {
        id: existing?.id || crypto.randomUUID(),
        user_id: params.userId,
        plan: params.plan,
        razorpay_subscription_id: params.razorpaySubscriptionId !== undefined ? params.razorpaySubscriptionId : (existing?.razorpay_subscription_id || null),
        razorpay_customer_id: params.razorpayCustomerId !== undefined ? params.razorpayCustomerId : (existing?.razorpay_customer_id || null),
        status: params.status,
        start_date: params.startDate || existing?.start_date || new Date().toISOString(),
        end_date: params.endDate !== undefined ? params.endDate : (existing?.end_date || null),
        created_at: existing?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memorySubscriptions.set(params.userId, updated);
      return updated;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .upsert(payload, { onConflict: 'user_id' })
        .select('*')
        .single();

      if (error) {
        console.error('[SupabaseBackendService] Upsert error:', error.message);
        throw new Error(`Failed to upsert subscription in database: ${error.message}`);
      }

      return data as DbSubscription;
    } catch (err: any) {
      console.error('[SupabaseBackendService] Exception in upsertSubscription:', err);
      // Fallback cache save
      const fallbackRecord: DbSubscription = {
        id: crypto.randomUUID(),
        user_id: params.userId,
        plan: params.plan,
        razorpay_subscription_id: params.razorpaySubscriptionId || null,
        razorpay_customer_id: params.razorpayCustomerId || null,
        status: params.status,
        start_date: params.startDate || new Date().toISOString(),
        end_date: params.endDate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memorySubscriptions.set(params.userId, fallbackRecord);
      return fallbackRecord;
    }
  },

  /**
   * Update status and duration by Razorpay subscription ID (invoked by webhook events)
   */
  updateSubscriptionByRazorpayId: async (
    razorpaySubId: string,
    updates: {
      status: DbSubscription['status'];
      plan?: PlanTier;
      startDate?: string;
      endDate?: string | null;
      razorpayCustomerId?: string | null;
      userId?: string;
    }
  ): Promise<DbSubscription | null> => {
    if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-service-key') {
      for (const [uid, sub] of memorySubscriptions.entries()) {
        if (sub.razorpay_subscription_id === razorpaySubId) {
          const updated: DbSubscription = {
            ...sub,
            status: updates.status,
            ...(updates.plan && { plan: updates.plan }),
            ...(updates.startDate && { start_date: updates.startDate }),
            ...(updates.endDate !== undefined && { end_date: updates.endDate }),
            ...(updates.razorpayCustomerId && { razorpay_customer_id: updates.razorpayCustomerId }),
            updated_at: new Date().toISOString(),
          };
          memorySubscriptions.set(uid, updated);
          return updated;
        }
      }
      if (updates.userId) {
        const existing = memorySubscriptions.get(updates.userId);
        const updated: DbSubscription = {
          id: existing?.id || crypto.randomUUID(),
          user_id: updates.userId,
          plan: updates.plan || existing?.plan || 'pro',
          razorpay_subscription_id: razorpaySubId,
          razorpay_customer_id: updates.razorpayCustomerId || existing?.razorpay_customer_id || null,
          status: updates.status,
          start_date: updates.startDate || existing?.start_date || new Date().toISOString(),
          end_date: updates.endDate !== undefined ? updates.endDate : (existing?.end_date || null),
          created_at: existing?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        memorySubscriptions.set(updates.userId, updated);
        return updated;
      }
      return null;
    }

    try {
      const payload: Record<string, any> = {
        status: updates.status,
        updated_at: new Date().toISOString(),
      };
      if (updates.plan) payload.plan = updates.plan;
      if (updates.startDate) payload.start_date = updates.startDate;
      if (updates.endDate !== undefined) payload.end_date = updates.endDate;
      if (updates.razorpayCustomerId) payload.razorpay_customer_id = updates.razorpayCustomerId;

      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update(payload)
        .eq('razorpay_subscription_id', razorpaySubId)
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('[SupabaseBackendService] updateByRazorpayId error:', error.message);
      }

      if (!data && updates.userId) {
        const { data: byUser, error: byUserError } = await supabaseAdmin
          .from('subscriptions')
          .update({ ...payload, razorpay_subscription_id: razorpaySubId })
          .eq('user_id', updates.userId)
          .select('*')
          .maybeSingle();
        if (!byUserError && byUser) return byUser as DbSubscription;
      }

      return data as DbSubscription | null;
    } catch (err) {
      console.error('[SupabaseBackendService] Exception in updateSubscriptionByRazorpayId:', err);
      return null;
    }
  },

  /**
   * Idempotency Check: Verify if a webhook event ID has already been recorded
   */
  isEventProcessed: async (eventId: string): Promise<boolean> => {
    if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-service-key') {
      return memoryEvents.has(eventId);
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('payment_events')
        .select('id')
        .eq('razorpay_event_id', eventId)
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseBackendService] Warning checking payment event idempotency:', error.message);
        return memoryEvents.has(eventId);
      }

      return Boolean(data);
    } catch (err) {
      console.error('[SupabaseBackendService] Exception in isEventProcessed:', err);
      return memoryEvents.has(eventId);
    }
  },

  /**
   * Record a processed webhook event for idempotency and audit trail
   */
  recordPaymentEvent: async (
    eventId: string,
    eventType: string,
    payload: any
  ): Promise<boolean> => {
    memoryEvents.add(eventId);

    if (!supabaseUrl || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-service-key') {
      return true;
    }

    try {
      const { error } = await supabaseAdmin.from('payment_events').insert({
        razorpay_event_id: eventId,
        event_type: eventType,
        payload: payload,
        processed_at: new Date().toISOString(),
      });

      if (error) {
        // If unique constraint violation, it was already recorded concurrently
        if (error.code === '23505') {
          return false;
        }
        console.error('[SupabaseBackendService] Failed to record payment event:', error.message);
      }

      return true;
    } catch (err) {
      console.error('[SupabaseBackendService] Exception in recordPaymentEvent:', err);
      return true;
    }
  },
};
