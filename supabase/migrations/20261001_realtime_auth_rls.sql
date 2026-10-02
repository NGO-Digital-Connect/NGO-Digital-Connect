-- ==============================================================================
-- NGO Digital Connect - Realtime Auth, Trigger, and Strict RLS Migration
-- Version: 2.0.0
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. HELPER FUNCTION TO GET CURRENT USER ROLE FROM AUTH CLAIMS OR PROFILES
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Check user metadata from JWT
    v_role := (auth.jwt() -> 'user_metadata' ->> 'role');
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Check app metadata from JWT
    v_role := (auth.jwt() -> 'app_metadata' ->> 'role');
    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Look up in profiles if authenticated
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
-- 4. PROFILE & ROLE INITIALIZATION TRIGGER FROM auth.users
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

    -- Insert or update profile using auth user's UUID
    INSERT INTO public.profiles (
        id,
        email,
        role,
        status,
        name,
        phone,
        city,
        state,
        country,
        organization_name,
        designation,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        v_role,
        'ACTIVE',
        v_name,
        v_phone,
        v_city,
        v_state,
        v_country,
        v_org,
        v_desig,
        now(),
        now()
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

    -- Provision role-specific child row safely
    IF v_role = 'NGO' THEN
        INSERT INTO public.ngo_details (
            profile_id,
            registration_number,
            mission,
            service_areas,
            verification_status,
            tax_exemption_80g
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
            profile_id,
            skills,
            causes,
            availability,
            hours_logged
        ) VALUES (
            NEW.id,
            ARRAY['Community Service', 'First Aid & Triage'],
            ARRAY['healthcare', 'education'],
            COALESCE(NEW.raw_user_meta_data->>'availability', 'FLEXIBLE'),
            0
        ) ON CONFLICT (profile_id) DO NOTHING;
    ELSIF v_role = 'DONOR' THEN
        INSERT INTO public.donor_details (
            profile_id,
            preferred_causes,
            total_donated,
            is_anonymous_preferred
        ) VALUES (
            NEW.id,
            ARRAY['healthcare', 'education'],
            0,
            false
        ) ON CONFLICT (profile_id) DO NOTHING;
    ELSIF v_role = 'CSR' THEN
        INSERT INTO public.csr_details (
            profile_id,
            company_name,
            annual_budget,
            focus_states,
            preferred_causes,
            grants_committed
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
            profile_id,
            department,
            official_jurisdiction,
            designation,
            authorized_id_number
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

-- Re-bind trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. ENABLE REPLICA IDENTITY & REALTIME PUBLICATION
-- ==============================================================================

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.help_requests REPLICA IDENTITY FULL;
ALTER TABLE public.volunteer_applications REPLICA IDENTITY FULL;
ALTER TABLE public.volunteer_opportunities REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.donations REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.fund_utilizations REPLICA IDENTITY FULL;
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already present
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_applications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.volunteer_opportunities;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.fund_utilizations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END;
$$;

-- ==============================================================================
-- 6. AUDIT & CLEAN ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Drop all legacy permissive policies
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "NGO details are publicly readable" ON public.ngo_details;
DROP POLICY IF EXISTS "NGO can update own details" ON public.ngo_details;
DROP POLICY IF EXISTS "NGO can insert own details" ON public.ngo_details;

DROP POLICY IF EXISTS "NGO verification documents readable by NGO & Admin" ON public.ngo_verification_documents;

DROP POLICY IF EXISTS "Volunteer details readable by all" ON public.volunteer_details;
DROP POLICY IF EXISTS "Volunteer details modifiable by owner" ON public.volunteer_details;

DROP POLICY IF EXISTS "Donor details readable by owner and admin" ON public.donor_details;
DROP POLICY IF EXISTS "Donor details modifiable by owner" ON public.donor_details;

DROP POLICY IF EXISTS "CSR details readable by all" ON public.csr_details;
DROP POLICY IF EXISTS "CSR details modifiable by owner" ON public.csr_details;

DROP POLICY IF EXISTS "Government details readable by all" ON public.government_details;
DROP POLICY IF EXISTS "Government details modifiable by owner" ON public.government_details;

DROP POLICY IF EXISTS "Projects are publicly readable" ON public.projects;
DROP POLICY IF EXISTS "NGOs can insert projects" ON public.projects;
DROP POLICY IF EXISTS "NGOs can update own projects" ON public.projects;

DROP POLICY IF EXISTS "Project milestones are publicly readable" ON public.project_milestones;
DROP POLICY IF EXISTS "Project milestones modifiable by project NGO" ON public.project_milestones;

DROP POLICY IF EXISTS "Project updates are publicly readable" ON public.project_updates;
DROP POLICY IF EXISTS "Project updates modifiable by project NGO" ON public.project_updates;

DROP POLICY IF EXISTS "Help requests privacy policy" ON public.help_requests;
DROP POLICY IF EXISTS "Beneficiaries can insert help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Authorized parties can update help requests" ON public.help_requests;

DROP POLICY IF EXISTS "Case documents access policy" ON public.case_documents;
DROP POLICY IF EXISTS "Case status history access policy" ON public.case_status_history;

DROP POLICY IF EXISTS "Volunteer opportunities are publicly readable" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "NGOs can manage volunteer opportunities" ON public.volunteer_opportunities;

DROP POLICY IF EXISTS "Volunteer applications viewable by applicant and NGO" ON public.volunteer_applications;
DROP POLICY IF EXISTS "Volunteers can apply" ON public.volunteer_applications;
DROP POLICY IF EXISTS "NGOs can update applications" ON public.volunteer_applications;

DROP POLICY IF EXISTS "Donations readable by donor and project NGO" ON public.donations;
DROP POLICY IF EXISTS "Donors can insert donations" ON public.donations;

DROP POLICY IF EXISTS "Fund utilizations are publicly readable for transparency" ON public.fund_utilizations;
DROP POLICY IF EXISTS "NGOs can log fund utilization" ON public.fund_utilizations;

DROP POLICY IF EXISTS "Audit logs viewable by Admin and Government" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can append audit logs" ON public.audit_logs;

DROP POLICY IF EXISTS "Complaints readable by reporter and admin" ON public.complaints;
DROP POLICY IF EXISTS "Any authenticated user can file complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can resolve complaints" ON public.complaints;

DROP POLICY IF EXISTS "Notifications viewable only by recipient" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can mark own notifications read" ON public.notifications;

DROP POLICY IF EXISTS "Direct messages accessible by sender or receiver" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;

-- ==============================================================================
-- 7. RE-APPLY STRICT POLICIES
-- ==============================================================================

-- 7.1 Profiles
CREATE POLICY "Public profiles are readable" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.current_user_role() = 'ADMIN');

-- 7.2 NGO Details
CREATE POLICY "NGO details are publicly readable" ON public.ngo_details
    FOR SELECT USING (true);

CREATE POLICY "NGO can insert own details" ON public.ngo_details
    FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "NGO can update own details" ON public.ngo_details
    FOR UPDATE USING (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

-- 7.3 Volunteer Details
CREATE POLICY "Volunteer details are publicly readable" ON public.volunteer_details
    FOR SELECT USING (true);

CREATE POLICY "Volunteer can insert own details" ON public.volunteer_details
    FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Volunteer can update own details" ON public.volunteer_details
    FOR UPDATE USING (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

-- 7.4 Donor Details
CREATE POLICY "Donor details readable by owner and admin" ON public.donor_details
    FOR SELECT USING (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Donor can insert own details" ON public.donor_details
    FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Donor can update own details" ON public.donor_details
    FOR UPDATE USING (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

-- 7.5 CSR Details
CREATE POLICY "CSR details are publicly readable" ON public.csr_details
    FOR SELECT USING (true);

CREATE POLICY "CSR can insert own details" ON public.csr_details
    FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "CSR can update own details" ON public.csr_details
    FOR UPDATE USING (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

-- 7.6 Government Details
CREATE POLICY "Government details are publicly readable" ON public.government_details
    FOR SELECT USING (true);

CREATE POLICY "Government can insert own details" ON public.government_details
    FOR INSERT WITH CHECK (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Government can update own details" ON public.government_details
    FOR UPDATE USING (auth.uid() = profile_id OR public.current_user_role() = 'ADMIN');

-- 7.7 Projects, Milestones & Updates
CREATE POLICY "Projects are publicly readable" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "NGOs can insert projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = ngo_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "NGOs can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = ngo_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Project milestones are publicly readable" ON public.project_milestones
    FOR SELECT USING (true);

CREATE POLICY "NGOs can manage project milestones" ON public.project_milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_milestones.project_id
            AND (projects.ngo_id = auth.uid() OR public.current_user_role() = 'ADMIN')
        )
    );

CREATE POLICY "Project updates are publicly readable" ON public.project_updates
    FOR SELECT USING (true);

CREATE POLICY "NGOs can manage project updates" ON public.project_updates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_updates.project_id
            AND (projects.ngo_id = auth.uid() OR public.current_user_role() = 'ADMIN')
        )
    );

-- 7.8 Help Requests
CREATE POLICY "Help requests read policy" ON public.help_requests
    FOR SELECT USING (
        beneficiary_id = auth.uid()
        OR assigned_ngo_id = auth.uid()
        OR (assigned_ngo_id IS NULL AND public.current_user_role() IN ('NGO', 'ADMIN', 'GOVERNMENT'))
        OR public.current_user_role() IN ('ADMIN', 'GOVERNMENT')
    );

CREATE POLICY "Beneficiaries can insert help requests" ON public.help_requests
    FOR INSERT WITH CHECK (beneficiary_id = auth.uid() OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Authorized parties can update help requests" ON public.help_requests
    FOR UPDATE USING (
        beneficiary_id = auth.uid()
        OR assigned_ngo_id = auth.uid()
        OR (assigned_ngo_id IS NULL AND public.current_user_role() = 'NGO')
        OR public.current_user_role() IN ('ADMIN', 'GOVERNMENT')
    );

CREATE POLICY "Case documents read policy" ON public.case_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.help_requests
            WHERE help_requests.id = case_documents.help_request_id
            AND (
                help_requests.beneficiary_id = auth.uid()
                OR help_requests.assigned_ngo_id = auth.uid()
                OR public.current_user_role() IN ('NGO', 'ADMIN', 'GOVERNMENT')
            )
        )
    );

CREATE POLICY "Case documents insert policy" ON public.case_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.help_requests
            WHERE help_requests.id = case_documents.help_request_id
            AND (help_requests.beneficiary_id = auth.uid() OR public.current_user_role() = 'ADMIN')
        )
    );

CREATE POLICY "Case status history read policy" ON public.case_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.help_requests
            WHERE help_requests.id = case_status_history.help_request_id
            AND (
                help_requests.beneficiary_id = auth.uid()
                OR help_requests.assigned_ngo_id = auth.uid()
                OR public.current_user_role() IN ('NGO', 'ADMIN', 'GOVERNMENT')
            )
        )
    );

CREATE POLICY "Case status history insert policy" ON public.case_status_history
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 7.9 Volunteer Opportunities & Applications
CREATE POLICY "Volunteer opportunities are publicly readable" ON public.volunteer_opportunities
    FOR SELECT USING (true);

CREATE POLICY "NGOs can manage volunteer opportunities" ON public.volunteer_opportunities
    FOR ALL USING (auth.uid() = ngo_id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Volunteer applications viewable by applicant and NGO" ON public.volunteer_applications
    FOR SELECT USING (
        volunteer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.volunteer_opportunities
            WHERE volunteer_opportunities.id = volunteer_applications.opportunity_id
            AND volunteer_opportunities.ngo_id = auth.uid()
        )
        OR public.current_user_role() = 'ADMIN'
    );

CREATE POLICY "Volunteers can apply" ON public.volunteer_applications
    FOR INSERT WITH CHECK (volunteer_id = auth.uid());

CREATE POLICY "NGOs can update applications" ON public.volunteer_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.volunteer_opportunities
            WHERE volunteer_opportunities.id = volunteer_applications.opportunity_id
            AND volunteer_opportunities.ngo_id = auth.uid()
        )
        OR public.current_user_role() = 'ADMIN'
    );

-- 7.10 Donations & Fund Utilizations
CREATE POLICY "Donations readable by donor and project NGO" ON public.donations
    FOR SELECT USING (
        donor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = donations.project_id
            AND projects.ngo_id = auth.uid()
        )
        OR public.current_user_role() IN ('ADMIN', 'GOVERNMENT')
    );

CREATE POLICY "Donors can insert donations" ON public.donations
    FOR INSERT WITH CHECK (donor_id = auth.uid() OR is_anonymous = true);

CREATE POLICY "Fund utilizations are publicly readable for transparency" ON public.fund_utilizations
    FOR SELECT USING (true);

CREATE POLICY "NGOs can log fund utilization" ON public.fund_utilizations
    FOR INSERT WITH CHECK (ngo_id = auth.uid() OR public.current_user_role() = 'ADMIN');

-- 7.11 Audit Logs, Complaints, Notifications & Direct Messages
CREATE POLICY "Audit logs viewable by Admin and Government" ON public.audit_logs
    FOR SELECT USING (public.current_user_role() IN ('ADMIN', 'GOVERNMENT'));

CREATE POLICY "Authenticated users can append audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Complaints readable by reporter and admin" ON public.complaints
    FOR SELECT USING (reporter_id = auth.uid() OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Authenticated users can file complaints" ON public.complaints
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can update complaints" ON public.complaints
    FOR UPDATE USING (public.current_user_role() = 'ADMIN');

CREATE POLICY "Notifications viewable only by recipient" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Authenticated users and triggers can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can mark own notifications read" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Direct messages accessible by sender or receiver" ON public.direct_messages
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send direct messages" ON public.direct_messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());
