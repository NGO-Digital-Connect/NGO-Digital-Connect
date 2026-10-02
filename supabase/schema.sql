-- ==============================================================================
-- NGO Digital Connect - Complete PostgreSQL Database Schema
-- Version: 1.0.0
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to inspect current user role from auth.jwt() claims or profiles
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    v_role := (auth.jwt() -> 'user_metadata' ->> 'role');
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    v_role := (auth.jwt() -> 'app_metadata' ->> 'role');
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    IF auth.uid() IS NOT NULL THEN
        SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
        IF v_role IS NOT NULL THEN
            RETURN v_role;
        END IF;
    END IF;

    RETURN 'ANONYMOUS';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 3. CORE PROFILES / USERS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('BENEFICIARY', 'NGO', 'VOLUNTEER', 'DONOR', 'CSR', 'GOVERNMENT', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED')),
    name TEXT NOT NULL,
    phone TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    bio TEXT,
    avatar TEXT,
    organization_name TEXT,
    designation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. ROLE SPECIFIC DETAIL TABLES
-- ==============================================================================

-- NGO Details
CREATE TABLE IF NOT EXISTS ngo_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    ngo_id TEXT UNIQUE,
    registration_number TEXT NOT NULL,
    founded_year INTEGER,
    mission TEXT,
    causes TEXT[] NOT NULL DEFAULT '{}',
    service_areas TEXT[] NOT NULL DEFAULT '{}',
    tax_exemption_80g BOOLEAN NOT NULL DEFAULT false,
    csr1_number TEXT,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    total_beneficiaries_served INTEGER NOT NULL DEFAULT 0,
    active_project_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_ngo_details_updated_at
BEFORE UPDATE ON ngo_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NGO Verification Documents
CREATE TABLE IF NOT EXISTS ngo_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_detail_id UUID NOT NULL REFERENCES ngo_details(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Volunteer Details
CREATE TABLE IF NOT EXISTS volunteer_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    skills TEXT[] NOT NULL DEFAULT '{}',
    causes TEXT[] NOT NULL DEFAULT '{}',
    availability TEXT NOT NULL DEFAULT 'FLEXIBLE' CHECK (availability IN ('WEEKDAYS', 'WEEKENDS', 'FLEXIBLE', 'FULL_TIME')),
    hours_logged NUMERIC NOT NULL DEFAULT 0,
    experience_years INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_volunteer_details_updated_at
BEFORE UPDATE ON volunteer_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Donor Details
CREATE TABLE IF NOT EXISTS donor_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    preferred_causes TEXT[] NOT NULL DEFAULT '{}',
    tax_pan TEXT,
    total_donated NUMERIC NOT NULL DEFAULT 0,
    is_anonymous_preferred BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_donor_details_updated_at
BEFORE UPDATE ON donor_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CSR Details
CREATE TABLE IF NOT EXISTS csr_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT NOT NULL,
    cin_number TEXT,
    annual_budget NUMERIC NOT NULL DEFAULT 0,
    focus_states TEXT[] NOT NULL DEFAULT '{}',
    preferred_causes TEXT[] NOT NULL DEFAULT '{}',
    grants_committed NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_csr_details_updated_at
BEFORE UPDATE ON csr_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Government Details
CREATE TABLE IF NOT EXISTS government_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    department TEXT NOT NULL,
    official_jurisdiction TEXT,
    designation TEXT,
    authorized_id_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_government_details_updated_at
BEFORE UPDATE ON government_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. PROJECTS, MILESTONES & UPDATES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cause TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_state TEXT NOT NULL,
    target_beneficiaries INTEGER NOT NULL DEFAULT 0,
    reached_beneficiaries INTEGER NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    funding_target NUMERIC NOT NULL DEFAULT 0,
    funding_raised NUMERIC NOT NULL DEFAULT 0,
    volunteers_needed INTEGER NOT NULL DEFAULT 0,
    volunteers_enrolled INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'UPCOMING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    image_url TEXT,
    allow_overfunding BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_date DATE,
    evidence_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_project_milestones_updated_at
BEFORE UPDATE ON project_milestones
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. BENEFICIARY HELP REQUESTS & CASE HISTORY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS help_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_address TEXT,
    location_postal_code TEXT,
    required_support_type TEXT NOT NULL CHECK (required_support_type IN ('FINANCIAL', 'MEDICAL', 'FOOD_RATION', 'EDUCATION', 'SHELTER', 'EQUIPMENT', 'VOLUNTEER_HELP')),
    estimated_cost NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'ON_HOLD', 'CANCELLED')),
    assigned_ngo_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_staff_name TEXT,
    linked_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolution_evidence_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_help_requests_updated_at
BEFORE UPDATE ON help_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS case_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    help_request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    help_request_id UUID NOT NULL REFERENCES help_requests(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'ON_HOLD', 'CANCELLED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by TEXT NOT NULL,
    note TEXT
);

-- ==============================================================================
-- 7. VOLUNTEER OPPORTUNITIES & APPLICATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    cause TEXT NOT NULL,
    description TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_mode TEXT NOT NULL DEFAULT 'ON_FIELD' CHECK (location_mode IN ('ON_FIELD', 'REMOTE', 'HYBRID')),
    date TEXT NOT NULL,
    duration TEXT NOT NULL,
    skills_required TEXT[] NOT NULL DEFAULT '{}',
    slots_total INTEGER NOT NULL DEFAULT 1 CHECK (slots_total >= 0),
    slots_filled INTEGER NOT NULL DEFAULT 0 CHECK (slots_filled >= 0),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FULL', 'COMPLETED', 'CANCELLED')),
    requirements TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_volunteer_opportunities_updated_at
BEFORE UPDATE ON volunteer_opportunities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED')),
    hours_logged NUMERIC DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_volunteer_application UNIQUE (opportunity_id, volunteer_id)
);

CREATE TRIGGER update_volunteer_applications_updated_at
BEFORE UPDATE ON volunteer_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. DONATIONS & FUND UTILIZATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    donated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    receipt_number TEXT NOT NULL UNIQUE,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUCCESSFUL' CHECK (status IN ('SUCCESSFUL', 'PROCESSING', 'REFUNDED')),
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    donor_message TEXT
);

CREATE TABLE IF NOT EXISTS fund_utilizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    category TEXT NOT NULL CHECK (category IN (
        'DIRECT_RELIEF', 'MEDICAL_SUPPLIES', 'FOOD_PROVISIONS',
        'EDUCATION_KITS', 'LOGISTICS_TRANSPORT', 'FIELD_EQUIPMENT', 'SHELTER_MATERIALS'
    )),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    spent_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vendor_name TEXT NOT NULL,
    invoice_proof_url TEXT,
    recorded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 9. AUDIT LOGS, COMPLAINTS, NOTIFICATIONS & MESSAGES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL CHECK (target_entity IN ('CASE', 'PROJECT', 'DONATION', 'OPPORTUNITY', 'NGO', 'USER')),
    target_id TEXT NOT NULL,
    details TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('PROJECT', 'NGO', 'USER', 'CASE')),
    target_id TEXT NOT NULL,
    target_title TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT
);

CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES help_requests(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 10. CONCURRENCY-SAFE POSTGRESQL FUNCTIONS (RPCs)
-- ==============================================================================

-- 10.1 Safe Volunteer Application with Row Locking
CREATE OR REPLACE FUNCTION rpc_apply_for_opportunity(
    p_opportunity_id UUID,
    p_volunteer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_opp RECORD;
    v_existing UUID;
    v_app_id UUID;
    v_volunteer_name TEXT;
BEGIN
    -- Acquire exclusive row lock on the opportunity to prevent race condition
    SELECT * INTO v_opp
    FROM volunteer_opportunities
    WHERE id = p_opportunity_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Opportunity not found.');
    END IF;

    IF v_opp.slots_filled >= v_opp.slots_total THEN
        RETURN jsonb_build_object('success', false, 'message', 'Capacity full! No additional slots available for this opportunity.');
    END IF;

    -- Check if volunteer already applied
    SELECT id INTO v_existing
    FROM volunteer_applications
    WHERE opportunity_id = p_opportunity_id AND volunteer_id = p_volunteer_id;

    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'You have already submitted an application for this opportunity.');
    END IF;

    SELECT name INTO v_volunteer_name FROM profiles WHERE id = p_volunteer_id;

    -- Insert new application
    INSERT INTO volunteer_applications (
        opportunity_id,
        volunteer_id,
        applied_at,
        status
    ) VALUES (
        p_opportunity_id,
        p_volunteer_id,
        now(),
        'PENDING'
    ) RETURNING id INTO v_app_id;

    -- Notify the NGO
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        v_opp.ngo_id,
        'New Volunteer Application',
        COALESCE(v_volunteer_name, 'A volunteer') || ' applied for "' || v_opp.title || '".',
        'INFO'
    );

    -- Log audit trail
    INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, target_entity, target_id, details)
    VALUES (
        p_volunteer_id,
        COALESCE(v_volunteer_name, 'Volunteer'),
        'VOLUNTEER',
        'VOLUNTEER_APPLIED',
        'OPPORTUNITY',
        p_opportunity_id::text,
        'Volunteer applied for opportunity "' || v_opp.title || '"'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Application submitted successfully to the NGO for review.',
        'application_id', v_app_id
    );
END;
$$;

-- 10.2 Safe Application Status Update with Slot & Project Sync
CREATE OR REPLACE FUNCTION rpc_update_application_status(
    p_application_id UUID,
    p_status TEXT,
    p_actor_id UUID,
    p_actor_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app RECORD;
    v_opp RECORD;
    v_new_filled INTEGER;
BEGIN
    SELECT * INTO v_app FROM volunteer_applications WHERE id = p_application_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Application not found.');
    END IF;

    -- Update application status
    UPDATE volunteer_applications SET status = p_status, updated_at = now() WHERE id = p_application_id;

    -- If accepted, lock opportunity and increment slots
    IF p_status = 'ACCEPTED' AND v_app.status != 'ACCEPTED' THEN
        SELECT * INTO v_opp FROM volunteer_opportunities WHERE id = v_app.opportunity_id FOR UPDATE;
        IF FOUND THEN
            v_new_filled := v_opp.slots_filled + 1;
            UPDATE volunteer_opportunities
            SET slots_filled = v_new_filled,
                status = CASE WHEN v_new_filled >= slots_total THEN 'FULL' ELSE status END,
                updated_at = now()
            WHERE id = v_opp.id;

            -- Update project enrolled volunteers if linked
            IF v_opp.project_id IS NOT NULL THEN
                UPDATE projects
                SET volunteers_enrolled = volunteers_enrolled + 1,
                    updated_at = now()
                WHERE id = v_opp.project_id;
            END IF;

            -- Notify volunteer
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (
                v_app.volunteer_id,
                'Application Accepted!',
                'Your application for "' || v_opp.title || '" was approved! Check your briefing details.',
                'SUCCESS'
            );
        END IF;
    END IF;

    -- Log audit
    INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, target_entity, target_id, details)
    VALUES (
        p_actor_id,
        p_actor_name,
        'NGO',
        'VOLUNTEER_APP_STATUS_CHANGED',
        'OPPORTUNITY',
        v_app.opportunity_id::text,
        'Application ' || p_application_id::text || ' updated to ' || p_status
    );

    RETURN jsonb_build_object('success', true, 'message', 'Application status updated.');
END;
$$;

-- 10.3 Safe Donation Processing with Project Balance Locking
CREATE OR REPLACE FUNCTION rpc_make_donation(
    p_donor_id UUID,
    p_project_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_is_anonymous BOOLEAN,
    p_donor_message TEXT,
    p_receipt_number TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_proj RECORD;
    v_donor RECORD;
    v_donation_id UUID;
    v_receipt TEXT;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Donation amount must be greater than zero.');
    END IF;

    -- Lock project row
    SELECT * INTO v_proj FROM projects WHERE id = p_project_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Target project not found.');
    END IF;

    SELECT * INTO v_donor FROM profiles WHERE id = p_donor_id;

    v_receipt := COALESCE(p_receipt_number, '80G-NGO-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6));

    -- Insert donation record
    INSERT INTO donations (
        donor_id,
        project_id,
        amount,
        currency,
        donated_at,
        receipt_number,
        payment_method,
        status,
        is_anonymous,
        donor_message
    ) VALUES (
        p_donor_id,
        p_project_id,
        p_amount,
        'INR',
        now(),
        v_receipt,
        p_payment_method,
        'SUCCESSFUL',
        p_is_anonymous,
        p_donor_message
    ) RETURNING id INTO v_donation_id;

    -- Update project raised total atomically
    UPDATE projects
    SET funding_raised = funding_raised + p_amount,
        updated_at = now()
    WHERE id = p_project_id;

    -- Update donor total donated in donor_details if exists
    UPDATE donor_details
    SET total_donated = total_donated + p_amount,
        updated_at = now()
    WHERE profile_id = p_donor_id;

    -- Log audit
    INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, target_entity, target_id, details)
    VALUES (
        p_donor_id,
        CASE WHEN p_is_anonymous THEN 'Anonymous Philanthropist' ELSE COALESCE(v_donor.name, 'Donor') END,
        COALESCE(v_donor.role, 'DONOR'),
        'DONATION_RECEIVED',
        'PROJECT',
        p_project_id::text,
        'Received ₹' || p_amount::text || ' contribution. Receipt: ' || v_receipt
    );

    -- Notify donor
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        p_donor_id,
        'Contribution Receipt Confirmed',
        'Thank you! ₹' || p_amount::text || ' donated to "' || v_proj.title || '". 80G Receipt: ' || v_receipt || '.',
        'SUCCESS'
    );

    -- Notify NGO
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        v_proj.ngo_id,
        'Donation Received',
        'New contribution of ₹' || p_amount::text || ' received for "' || v_proj.title || '".',
        'SUCCESS'
    );

    RETURN jsonb_build_object(
        'success', true,
        'donation_id', v_donation_id,
        'receipt_number', v_receipt,
        'amount', p_amount
    );
END;
$$;

-- 10.4 Safe Fund Utilization Recording with Available Balance Verification
CREATE OR REPLACE FUNCTION rpc_log_fund_utilization(
    p_project_id UUID,
    p_ngo_id UUID,
    p_category TEXT,
    p_amount NUMERIC,
    p_description TEXT,
    p_spent_date DATE,
    p_vendor_name TEXT,
    p_invoice_proof_url TEXT,
    p_recorded_by TEXT,
    p_actor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_proj RECORD;
    v_current_spent NUMERIC;
    v_available NUMERIC;
    v_util_id UUID;
BEGIN
    -- Lock project row
    SELECT * INTO v_proj FROM projects WHERE id = p_project_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Project not found.');
    END IF;

    -- Calculate total spent so far
    SELECT COALESCE(SUM(amount), 0) INTO v_current_spent
    FROM fund_utilizations
    WHERE project_id = p_project_id;

    v_available := v_proj.funding_raised - v_current_spent;

    IF p_amount > v_available THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Expense ₹' || p_amount::text || ' exceeds current available project balance ₹' || v_available::text || '.'
        );
    END IF;

    -- Insert expense utilization
    INSERT INTO fund_utilizations (
        project_id,
        ngo_id,
        category,
        amount,
        description,
        spent_date,
        vendor_name,
        invoice_proof_url,
        recorded_by
    ) VALUES (
        p_project_id,
        p_ngo_id,
        p_category,
        p_amount,
        p_description,
        p_spent_date,
        p_vendor_name,
        p_invoice_proof_url,
        p_recorded_by
    ) RETURNING id INTO v_util_id;

    -- Audit log
    INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, target_entity, target_id, details)
    VALUES (
        p_actor_id,
        p_recorded_by,
        'NGO',
        'FUND_UTILIZATION_RECORDED',
        'PROJECT',
        p_project_id::text,
        'Utilized ₹' || p_amount::text || ' for ' || p_category || ' (Vendor: ' || p_vendor_name || ')'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Expense utilization record logged with invoice reference.',
        'utilization_id', v_util_id
    );
END;
$$;

-- 10.5 Safe Case Resolution with Project Beneficiary Counter Sync
CREATE OR REPLACE FUNCTION rpc_resolve_case(
    p_case_id UUID,
    p_notes TEXT,
    p_evidence_url TEXT,
    p_actor_name TEXT,
    p_actor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_case RECORD;
BEGIN
    SELECT * INTO v_case FROM help_requests WHERE id = p_case_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Case not found.');
    END IF;

    -- Update case
    UPDATE help_requests
    SET status = 'RESOLVED',
        resolution_notes = p_notes,
        resolution_evidence_url = p_evidence_url,
        updated_at = now()
    WHERE id = p_case_id;

    -- Add to status history
    INSERT INTO case_status_history (help_request_id, status, updated_at, updated_by, note)
    VALUES (p_case_id, 'RESOLVED', now(), p_actor_name, 'Case resolved: ' || p_notes);

    -- If linked to a project, increment reached beneficiaries atomically
    IF v_case.linked_project_id IS NOT NULL THEN
        UPDATE projects
        SET reached_beneficiaries = reached_beneficiaries + 1,
            updated_at = now()
        WHERE id = v_case.linked_project_id;
    END IF;

    -- Audit log
    INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, target_entity, target_id, details)
    VALUES (
        p_actor_id,
        p_actor_name,
        'NGO',
        'CASE_RESOLVED',
        'CASE',
        p_case_id::text,
        'Resolution recorded with outcome notes.'
    );

    -- Notify beneficiary
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        v_case.beneficiary_id,
        'Case Successfully Resolved',
        'Your help request has been resolved. Notes: ' || p_notes,
        'SUCCESS'
    );

    RETURN jsonb_build_object('success', true, 'message', 'Case resolved successfully.');
END;
$$;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE csr_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_utilizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 11. PROFILE & ROLE INITIALIZATION TRIGGER FROM auth.users
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_phone TEXT;
    v_city TEXT;
    v_state TEXT;
    v_country TEXT;
    v_org TEXT;
    v_desig TEXT;
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'BENEFICIARY');
    v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Kolkata');
    v_state := COALESCE(NEW.raw_user_meta_data->>'state', 'West Bengal');
    v_country := COALESCE(NEW.raw_user_meta_data->>'country', 'India');
    v_org := NEW.raw_user_meta_data->>'organizationName';
    v_desig := NEW.raw_user_meta_data->>'designation';

    INSERT INTO public.profiles (
        id, email, role, status, name, phone, city, state, country, organization_name, designation, created_at, updated_at
    ) VALUES (
        NEW.id, NEW.email, v_role, 'ACTIVE', v_name, v_phone, v_city, v_state, v_country, v_org, v_desig, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name),
        role = COALESCE(EXCLUDED.role, profiles.role),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        city = COALESCE(EXCLUDED.city, profiles.city),
        state = COALESCE(EXCLUDED.state, profiles.state),
        organization_name = COALESCE(EXCLUDED.organization_name, profiles.organization_name),
        designation = COALESCE(EXCLUDED.designation, profiles.designation),
        updated_at = now();

    IF v_role = 'NGO' THEN
        INSERT INTO public.ngo_details (
            profile_id, registration_number, mission, service_areas, verification_status, tax_exemption_80g
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'registrationNumber', 'PROV-' || substr(NEW.id::text, 1, 8)),
            COALESCE(NEW.raw_user_meta_data->>'mission', 'Community welfare, empowerment and rapid relief.'),
            ARRAY[v_city],
            'PENDING',
            true
        ) ON CONFLICT (profile_id) DO NOTHING;
    ELSIF v_role = 'VOLUNTEER' THEN
        INSERT INTO public.volunteer_details (
            profile_id, skills, causes, availability, hours_logged
        ) VALUES (
            NEW.id,
            ARRAY['Community Service', 'First Aid & Triage'],
            ARRAY['healthcare', 'education'],
            COALESCE(NEW.raw_user_meta_data->>'availability', 'FLEXIBLE'),
            0
        ) ON CONFLICT (profile_id) DO NOTHING;
    ELSIF v_role = 'DONOR' THEN
        INSERT INTO public.donor_details (
            profile_id, preferred_causes, total_donated, is_anonymous_preferred
        ) VALUES (
            NEW.id,
            ARRAY['healthcare', 'education'],
            0,
            false
        ) ON CONFLICT (profile_id) DO NOTHING;
    ELSIF v_role = 'CSR' THEN
        INSERT INTO public.csr_details (
            profile_id, company_name, annual_budget, focus_states, preferred_causes, grants_committed
        ) VALUES (
            NEW.id,
            COALESCE(v_org, 'Corporate CSR Organization'),
            COALESCE((NEW.raw_user_meta_data->>'annualBudget')::numeric, 2500000),
            ARRAY[v_state],
            ARRAY['healthcare', 'education', 'environment'],
            0
        ) ON CONFLICT (profile_id) DO NOTHING;
    ELSIF v_role = 'GOVERNMENT' THEN
        INSERT INTO public.government_details (
            profile_id, department, official_jurisdiction, designation, authorized_id_number
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'department', 'District Social Welfare Office'),
            v_city || ' Unit',
            COALESCE(v_desig, 'Nodal Officer'),
            'GOV-' || substr(NEW.id::text, 1, 6)
        ) ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 12.1 Profiles Policies
CREATE POLICY "Public profiles are readable" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id OR current_user_role() = 'ADMIN');

-- 12.2 NGO Details & Documents
CREATE POLICY "NGO details are publicly readable" ON ngo_details
    FOR SELECT USING (true);

CREATE POLICY "NGO can insert own details" ON ngo_details
    FOR INSERT WITH CHECK (auth.uid() = profile_id OR current_user_role() = 'ADMIN');

CREATE POLICY "NGO can update own details" ON ngo_details
    FOR UPDATE USING (auth.uid() = profile_id OR current_user_role() = 'ADMIN');

CREATE POLICY "NGO verification documents readable by NGO & Admin" ON ngo_verification_documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM ngo_details WHERE ngo_details.id = ngo_verification_documents.ngo_detail_id AND ngo_details.profile_id = auth.uid())
        OR current_user_role() IN ('ADMIN', 'GOVERNMENT')
    );

-- 12.3 Volunteer, Donor, CSR, Government Details
CREATE POLICY "Volunteer details are publicly readable" ON volunteer_details FOR SELECT USING (true);
CREATE POLICY "Volunteer can insert own details" ON volunteer_details FOR INSERT WITH CHECK (auth.uid() = profile_id OR current_user_role() = 'ADMIN');
CREATE POLICY "Volunteer can update own details" ON volunteer_details FOR UPDATE USING (auth.uid() = profile_id OR current_user_role() = 'ADMIN');

CREATE POLICY "Donor details readable by owner and admin" ON donor_details
    FOR SELECT USING (auth.uid() = profile_id OR current_user_role() = 'ADMIN');
CREATE POLICY "Donor can insert own details" ON donor_details FOR INSERT WITH CHECK (auth.uid() = profile_id OR current_user_role() = 'ADMIN');
CREATE POLICY "Donor can update own details" ON donor_details FOR UPDATE USING (auth.uid() = profile_id OR current_user_role() = 'ADMIN');

CREATE POLICY "CSR details are publicly readable" ON csr_details FOR SELECT USING (true);
CREATE POLICY "CSR can insert own details" ON csr_details FOR INSERT WITH CHECK (auth.uid() = profile_id OR current_user_role() = 'ADMIN');
CREATE POLICY "CSR can update own details" ON csr_details FOR UPDATE USING (auth.uid() = profile_id OR current_user_role() = 'ADMIN');

CREATE POLICY "Government details are publicly readable" ON government_details FOR SELECT USING (true);
CREATE POLICY "Government can insert own details" ON government_details FOR INSERT WITH CHECK (auth.uid() = profile_id OR current_user_role() = 'ADMIN');
CREATE POLICY "Government can update own details" ON government_details FOR UPDATE USING (auth.uid() = profile_id OR current_user_role() = 'ADMIN');

-- 12.4 Projects, Milestones & Updates
CREATE POLICY "Projects are publicly readable" ON projects FOR SELECT USING (true);
CREATE POLICY "NGOs can insert projects" ON projects FOR INSERT WITH CHECK (auth.uid() = ngo_id OR current_user_role() = 'ADMIN');
CREATE POLICY "NGOs can update own projects" ON projects FOR UPDATE USING (auth.uid() = ngo_id OR current_user_role() = 'ADMIN');

CREATE POLICY "Project milestones are publicly readable" ON project_milestones FOR SELECT USING (true);
CREATE POLICY "NGOs can manage project milestones" ON project_milestones FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_milestones.project_id AND (projects.ngo_id = auth.uid() OR current_user_role() = 'ADMIN'))
);

CREATE POLICY "Project updates are publicly readable" ON project_updates FOR SELECT USING (true);
CREATE POLICY "NGOs can manage project updates" ON project_updates FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_updates.project_id AND (projects.ngo_id = auth.uid() OR current_user_role() = 'ADMIN'))
);

-- 12.5 Beneficiary Help Requests
CREATE POLICY "Help requests read policy" ON help_requests
    FOR SELECT USING (
        beneficiary_id = auth.uid()
        OR assigned_ngo_id = auth.uid()
        OR (assigned_ngo_id IS NULL AND current_user_role() IN ('NGO', 'ADMIN', 'GOVERNMENT'))
        OR current_user_role() IN ('ADMIN', 'GOVERNMENT')
    );

CREATE POLICY "Beneficiaries can insert help requests" ON help_requests
    FOR INSERT WITH CHECK (beneficiary_id = auth.uid() OR current_user_role() = 'ADMIN');

CREATE POLICY "Authorized parties can update help requests" ON help_requests
    FOR UPDATE USING (
        beneficiary_id = auth.uid()
        OR assigned_ngo_id = auth.uid()
        OR (assigned_ngo_id IS NULL AND current_user_role() = 'NGO')
        OR current_user_role() IN ('ADMIN', 'GOVERNMENT')
    );

CREATE POLICY "Case documents read policy" ON case_documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM help_requests WHERE help_requests.id = case_documents.help_request_id AND (
        help_requests.beneficiary_id = auth.uid()
        OR help_requests.assigned_ngo_id = auth.uid()
        OR current_user_role() IN ('NGO', 'ADMIN', 'GOVERNMENT')
    ))
);

CREATE POLICY "Case documents insert policy" ON case_documents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM help_requests WHERE help_requests.id = case_documents.help_request_id AND (
        help_requests.beneficiary_id = auth.uid() OR current_user_role() = 'ADMIN'
    ))
);

CREATE POLICY "Case status history read policy" ON case_status_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM help_requests WHERE help_requests.id = case_status_history.help_request_id AND (
        help_requests.beneficiary_id = auth.uid()
        OR help_requests.assigned_ngo_id = auth.uid()
        OR current_user_role() IN ('NGO', 'ADMIN', 'GOVERNMENT')
    ))
);

CREATE POLICY "Case status history insert policy" ON case_status_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 12.6 Volunteer Opportunities & Applications
CREATE POLICY "Volunteer opportunities are publicly readable" ON volunteer_opportunities FOR SELECT USING (true);
CREATE POLICY "NGOs can manage volunteer opportunities" ON volunteer_opportunities FOR ALL USING (auth.uid() = ngo_id OR current_user_role() = 'ADMIN');

CREATE POLICY "Volunteer applications viewable by applicant and NGO" ON volunteer_applications
    FOR SELECT USING (
        volunteer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM volunteer_opportunities WHERE volunteer_opportunities.id = volunteer_applications.opportunity_id AND volunteer_opportunities.ngo_id = auth.uid())
        OR current_user_role() = 'ADMIN'
    );
CREATE POLICY "Volunteers can apply" ON volunteer_applications FOR INSERT WITH CHECK (volunteer_id = auth.uid());
CREATE POLICY "NGOs can update applications" ON volunteer_applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM volunteer_opportunities WHERE volunteer_opportunities.id = volunteer_applications.opportunity_id AND volunteer_opportunities.ngo_id = auth.uid())
    OR current_user_role() = 'ADMIN'
);

-- 12.7 Donations & Fund Utilizations
CREATE POLICY "Donations readable by donor and project NGO" ON donations
    FOR SELECT USING (
        donor_id = auth.uid()
        OR EXISTS (SELECT 1 FROM projects WHERE projects.id = donations.project_id AND projects.ngo_id = auth.uid())
        OR current_user_role() IN ('ADMIN', 'GOVERNMENT')
    );
CREATE POLICY "Donors can insert donations" ON donations FOR INSERT WITH CHECK (donor_id = auth.uid() OR is_anonymous = true);

CREATE POLICY "Fund utilizations are publicly readable for transparency" ON fund_utilizations FOR SELECT USING (true);
CREATE POLICY "NGOs can log fund utilization" ON fund_utilizations FOR INSERT WITH CHECK (ngo_id = auth.uid() OR current_user_role() = 'ADMIN');

-- 12.8 Audit Logs, Complaints, Notifications & Direct Messages
CREATE POLICY "Audit logs viewable by Admin and Government" ON audit_logs
    FOR SELECT USING (current_user_role() IN ('ADMIN', 'GOVERNMENT'));
CREATE POLICY "Authenticated users can append audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Complaints readable by reporter and admin" ON complaints
    FOR SELECT USING (reporter_id = auth.uid() OR current_user_role() = 'ADMIN');
CREATE POLICY "Authenticated users can file complaints" ON complaints FOR INSERT WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Admins can update complaints" ON complaints FOR UPDATE USING (current_user_role() = 'ADMIN');

CREATE POLICY "Notifications viewable only by recipient" ON notifications
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Authenticated users and triggers can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can mark own notifications read" ON notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Direct messages accessible by sender or receiver" ON direct_messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send direct messages" ON direct_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
