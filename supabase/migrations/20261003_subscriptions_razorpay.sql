-- ==============================================================================
-- NGO Digital Connect - Razorpay Subscriptions & Payment Events Migration
-- Version: 2.1.0
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to automatically update updated_at (reused if already exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. SUBSCRIPTIONS TABLE
-- Source of truth for each user's current subscription status & tier
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    razorpay_subscription_id TEXT UNIQUE NULL,
    razorpay_customer_id TEXT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN (
            'created',
            'authenticated',
            'active',
            'pending',
            'halted',
            'cancelled',
            'completed',
            'expired'
        )
    ),
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id)
);

-- Index for high-speed lookups by user_id and razorpay_subscription_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_sub_id ON public.subscriptions(razorpay_subscription_id);

-- Automatic updated_at trigger
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 3. PAYMENT EVENTS TABLE
-- Audit log and webhook idempotency store
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on razorpay_event_id for fast idempotency lookups
CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON public.payment_events(razorpay_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_type ON public.payment_events(event_type);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Clients can ONLY read their own subscription; NO client-side mutations allowed.
-- Only the backend Node.js server (using Supabase Service Role Key) writes to these tables.
-- ==============================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Subscriptions Table Policies:
DROP POLICY IF EXISTS "Users can only read their own subscription" ON public.subscriptions;
CREATE POLICY "Users can only read their own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Explicitly ensure NO insert/update/delete policies exist for public/authenticated on subscriptions.
-- Service Role key automatically bypasses RLS and can perform full CRUD.

-- Payment Events Table Policies:
-- Strictly NO client-side access. Only Service Role can access this table.
-- (By enabling RLS and defining no policies for public/authenticated, client queries are rejected).

-- ==============================================================================
-- 5. AUTOMATIC FREE SUBSCRIPTION PROVISIONING TRIGGER FOR NEW USERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (
        user_id,
        plan,
        status,
        start_date,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        'free',
        'active',
        now(),
        now(),
        now()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Prevent registration failure if subscription provisioning fails
        RAISE WARNING 'Automatic subscription creation failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- ==============================================================================
-- 6. BACKFILL EXISTING USERS
-- Ensure all existing users have a 'free' active subscription row if missing
-- ==============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO public.subscriptions (user_id, plan, status, start_date)
        SELECT id, 'free', 'active', now()
        FROM auth.users
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;
