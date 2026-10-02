-- ==============================================================================
-- NGO Digital Connect - Complete Demo Seed Data
-- ==============================================================================

-- 1. PROFILES (7 Core Roles + 1 Extra NGO)
INSERT INTO profiles (id, email, role, status, name, phone, city, state, country, bio, organization_name, designation, created_at)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'rajesh.mondal@example.com',
    'BENEFICIARY',
    'ACTIVE',
    'Rajesh Mondal',
    '+91 98301 23456',
    'Kolkata',
    'West Bengal',
    'India',
    'Daily wage artisan seeking specialized cardiac surgery support for younger brother.',
    NULL,
    NULL,
    '2026-01-10T10:00:00Z'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'contact@preronamission.org',
    'NGO',
    'ACTIVE',
    'Dr. Ananya Sen',
    '+91 33 2489 1100',
    'Kolkata',
    'West Bengal',
    'India',
    'Dedicated to rapid rural healthcare, disaster response, and maternal care across eastern India.',
    'Prerona Rural Relief Mission',
    'Executive Director',
    '2025-06-15T08:30:00Z'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'director@vidyajyoti.org',
    'NGO',
    'ACTIVE',
    'Priya Sharma',
    '+91 22 2650 9988',
    'Mumbai',
    'Maharashtra',
    'India',
    'Empowering first-generation learners and girls with digital literacy and STEM infrastructure.',
    'Vidya Jyoti Foundation',
    'Founder & Head of Ops',
    '2025-08-20T11:00:00Z'
),
(
    'a0000000-0000-0000-0000-000000000004',
    'arjun.mehta@example.com',
    'VOLUNTEER',
    'ACTIVE',
    'Arjun Mehta',
    '+91 98200 44556',
    'Mumbai',
    'Maharashtra',
    'India',
    'Software engineer & weekend community educator with experience in teaching science and robotics.',
    NULL,
    NULL,
    '2026-02-01T14:15:00Z'
),
(
    'a0000000-0000-0000-0000-000000000005',
    'kavita.deshmukh@example.com',
    'DONOR',
    'ACTIVE',
    'Kavita Deshmukh',
    '+91 98111 88990',
    'Pune',
    'Maharashtra',
    'India',
    'Tech entrepreneur committed to child nutrition and emergency medical access.',
    NULL,
    NULL,
    '2025-11-12T09:20:00Z'
),
(
    'a0000000-0000-0000-0000-000000000006',
    'csr@tatanetworks.com',
    'CSR',
    'ACTIVE',
    'Vikramaditya Oberoi',
    '+91 11 4100 2233',
    'New Delhi',
    'Delhi NCR',
    'India',
    'Deploying strategic Corporate Social Responsibility capital aligned with Schedule VII priorities.',
    'Tata Networks CSR Foundation',
    'Head of Social Investments',
    '2025-04-10T16:00:00Z'
),
(
    'a0000000-0000-0000-0000-000000000007',
    'dm.kolkata@wb.gov.in',
    'GOVERNMENT',
    'ACTIVE',
    'Debashis Mukherjee, IAS',
    '+91 33 2214 5566',
    'Kolkata',
    'West Bengal',
    'India',
    'Institutional oversight for public welfare coordination and NGO partnerships.',
    'Department of Women & Child Welfare',
    'District Welfare Nodal Officer',
    '2025-01-05T12:00:00Z'
),
(
    'a0000000-0000-0000-0000-000000000008',
    'admin@ngodigitalconnect.org',
    'ADMIN',
    'ACTIVE',
    'Platform Oversight Officer',
    NULL,
    'New Delhi',
    'Delhi NCR',
    'India',
    'Responsible for NGO KYC accreditation, fraud monitoring, and platform governance.',
    'NGO Digital Connect Platform Ops',
    'Chief Compliance & Integrity Lead',
    '2025-01-01T00:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    bio = EXCLUDED.bio,
    organization_name = EXCLUDED.organization_name,
    designation = EXCLUDED.designation;

-- 2. NGO DETAILS
INSERT INTO ngo_details (id, profile_id, ngo_id, registration_number, founded_year, mission, causes, service_areas, tax_exemption_80g, csr1_number, verification_status, total_beneficiaries_served, active_project_count)
VALUES
(
    '10000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000002',
    'ngo_prerona_01',
    'WB/2012/0048291',
    2012,
    'Bridging healthcare and nutritional disparity in remote Sundarbans and South Bengal delta villages.',
    ARRAY['healthcare', 'food_nutrition', 'disaster_relief'],
    ARRAY['Kolkata', 'Howrah', 'South 24 Parganas'],
    true,
    'CSR00018492',
    'VERIFIED',
    24500,
    3
),
(
    '10000000-0000-0000-0000-000000000020',
    'a0000000-0000-0000-0000-000000000003',
    'ngo_vidya_02',
    'MH/2016/0091823',
    2016,
    'Transforming public schooling through solar-powered smart classes and vocational computer labs.',
    ARRAY['education', 'women_children'],
    ARRAY['Mumbai', 'Pune', 'Thane'],
    true,
    'CSR00024901',
    'VERIFIED',
    18200,
    2
)
ON CONFLICT (profile_id) DO UPDATE SET
    registration_number = EXCLUDED.registration_number,
    verification_status = EXCLUDED.verification_status,
    total_beneficiaries_served = EXCLUDED.total_beneficiaries_served,
    active_project_count = EXCLUDED.active_project_count;

-- 3. VOLUNTEER DETAILS
INSERT INTO volunteer_details (id, profile_id, skills, causes, availability, hours_logged, experience_years)
VALUES
(
    '10000000-0000-0000-0000-000000000030',
    'a0000000-0000-0000-0000-000000000004',
    ARRAY['Teaching & Tutoring', 'Photography & Media', 'Data Entry & Surveying'],
    ARRAY['education', 'environment'],
    'WEEKENDS',
    48,
    3
)
ON CONFLICT (profile_id) DO UPDATE SET
    hours_logged = EXCLUDED.hours_logged,
    availability = EXCLUDED.availability;

-- 4. DONOR DETAILS
INSERT INTO donor_details (id, profile_id, preferred_causes, tax_pan, total_donated, is_anonymous_preferred)
VALUES
(
    '10000000-0000-0000-0000-000000000040',
    'a0000000-0000-0000-0000-000000000005',
    ARRAY['healthcare', 'food_nutrition', 'women_children'],
    'AAACD1234F',
    125000,
    false
)
ON CONFLICT (profile_id) DO UPDATE SET
    total_donated = EXCLUDED.total_donated;

-- 5. CSR DETAILS
INSERT INTO csr_details (id, profile_id, company_name, cin_number, annual_budget, focus_states, preferred_causes, grants_committed)
VALUES
(
    '10000000-0000-0000-0000-000000000050',
    'a0000000-0000-0000-0000-000000000006',
    'Tata Networks Ltd',
    'L72200DL1998PLC092144',
    5000000,
    ARRAY['West Bengal', 'Maharashtra', 'Odisha'],
    ARRAY['education', 'healthcare', 'environment'],
    1850000
)
ON CONFLICT (profile_id) DO UPDATE SET
    annual_budget = EXCLUDED.annual_budget,
    grants_committed = EXCLUDED.grants_committed;

-- 6. GOVERNMENT DETAILS
INSERT INTO government_details (id, profile_id, department, official_jurisdiction, designation, authorized_id_number)
VALUES
(
    '10000000-0000-0000-0000-000000000060',
    'a0000000-0000-0000-0000-000000000007',
    'Dept. of Social Welfare & Disaster Management',
    'Kolkata & Suburbs District Unit',
    'Joint Director of Monitoring',
    'GOV-WB-SW-2021-994'
)
ON CONFLICT (profile_id) DO UPDATE SET
    department = EXCLUDED.department,
    official_jurisdiction = EXCLUDED.official_jurisdiction;

-- 7. PROJECTS
INSERT INTO projects (id, ngo_id, title, description, cause, location_city, location_state, target_beneficiaries, reached_beneficiaries, start_date, end_date, funding_target, funding_raised, volunteers_needed, volunteers_enrolled, status, image_url, allow_overfunding)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'Lifeline Sundarbans: Pediatric Cardiac Care & Mobile Health Vans',
    'Providing subsidized heart surgeries, diagnostic sonography, and emergency river-boat medical clinics across remote mangrove delta communities.',
    'healthcare',
    'Kolkata',
    'West Bengal',
    500,
    340,
    '2026-01-01',
    '2026-12-31',
    1500000,
    1120000,
    25,
    18,
    'ACTIVE',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    true
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'Digital Disha: Solar Smart Classrooms in Slum Communities',
    'Transforming municipal schools in Dharavi and Govandi with Raspberry Pi digital learning pods, coding bootcamps, and STEM kits for 2,000 girls.',
    'education',
    'Mumbai',
    'Maharashtra',
    2000,
    1450,
    '2025-07-01',
    '2026-06-30',
    800000,
    800000,
    30,
    30,
    'ACTIVE',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    false
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'Sundarbans Saline Soil Agri-Restoration & Women Seed Banks',
    'Helping 800 women farmers overcome cyclone salinization using indigenous salt-tolerant paddy seeds and organic vermicomposting beds.',
    'environment',
    'Kolkata',
    'West Bengal',
    800,
    620,
    '2025-05-01',
    '2026-04-30',
    600000,
    490000,
    15,
    12,
    'ACTIVE',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    false
)
ON CONFLICT (id) DO UPDATE SET
    funding_raised = EXCLUDED.funding_raised,
    reached_beneficiaries = EXCLUDED.reached_beneficiaries,
    volunteers_enrolled = EXCLUDED.volunteers_enrolled,
    status = EXCLUDED.status;

-- 8. PROJECT MILESTONES
INSERT INTO project_milestones (id, project_id, title, target_date, is_completed, completed_date, notes)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Launch 2 River-Boat Mobile Medical Clinics',
    '2026-02-15',
    true,
    '2026-02-10',
    'Two solar-retrofitted clinics operational in Gosaba and Basanti blocks.'
),
(
    '20000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Screen 1,000 Children for Congenital Heart Anomalies',
    '2026-05-30',
    true,
    '2026-03-01',
    'Screened 1,120 children; 14 critical cases scheduled for surgery.'
),
(
    '20000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Complete 25 Specialized Valve Surgeries',
    '2026-10-31',
    false,
    NULL,
    '11 surgeries completed at partner super-specialty hospital.'
),
(
    '20000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'Set Up 10 High-Efficiency Solar Battery Pods',
    '2025-09-15',
    true,
    '2025-09-10',
    NULL
),
(
    '20000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    'Train 50 School Teachers on Digital Curriculum',
    '2025-12-20',
    true,
    '2025-12-18',
    NULL
),
(
    '20000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    'Conduct Girls Coding Hackathon for 500 Students',
    '2026-04-30',
    false,
    NULL,
    NULL
),
(
    '20000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000003',
    'Establish 4 Community Seed Vaults',
    '2025-08-30',
    true,
    '2025-08-25',
    NULL
),
(
    '20000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000003',
    'Soil Desalination of 120 Acres of Farmland',
    '2026-03-31',
    false,
    NULL,
    NULL
)
ON CONFLICT (id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    completed_date = EXCLUDED.completed_date;

-- 9. PROJECT UPDATES
INSERT INTO project_updates (id, project_id, date, title, content, image_url)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '2026-03-15',
    'Boat Clinic Reaches Rangabelia Delta',
    'Our medical crew delivered maternal supplements and pediatric checks to 140 families cut off by recent high tides.',
    NULL
),
(
    '30000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    '2026-02-28',
    'Classroom Attendance Increases by 38%',
    'With interactive visual learning tablets, student engagement scores improved significantly in primary math assessments.',
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- 10. HELP REQUESTS
INSERT INTO help_requests (id, beneficiary_id, title, category, urgency, description, location_city, location_state, location_address, location_postal_code, required_support_type, estimated_cost, status, assigned_ngo_id, assigned_staff_name, linked_project_id, resolution_notes, resolution_evidence_url, submitted_at, updated_at)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Urgent Pediatric Heart Valve Surgery for 9-year-old Subham',
    'healthcare',
    'CRITICAL',
    'Subham was diagnosed with congenital mitral valve stenosis at Nil Ratan Sircar Medical College. Family income is ₹8,000/month from pottery. Immediate surgical intervention required within 3 weeks.',
    'Kolkata',
    'West Bengal',
    'Lane 4, Kumartuli, North Kolkata',
    '700005',
    'MEDICAL',
    180000,
    'IN_PROGRESS',
    'a0000000-0000-0000-0000-000000000002',
    'Dr. Ananya Sen',
    'b0000000-0000-0000-0000-000000000001',
    NULL,
    NULL,
    '2026-03-01T10:30:00Z',
    '2026-03-15T12:00:00Z'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'School Fee & Books Support for Two Orphaned Sisters',
    'education',
    'HIGH',
    'Following the demise of both parents during seasonal floods, two girls (ages 11 and 13) risk dropping out of St. Xavier Boarding School in Purulia. Annual boarding and uniform fees need coverage.',
    'Howrah',
    'West Bengal',
    'Vill: Bagnan, Dist Howrah',
    '711303',
    'EDUCATION',
    45000,
    'VERIFIED',
    'a0000000-0000-0000-0000-000000000002',
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-03-10T08:00:00Z',
    '2026-03-12T16:20:00Z'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Solar Microgrid & Water Filter for Coastal Fishing Hamlet',
    'environment',
    'MEDIUM',
    '45 tribal fishing families in Gosaba Island lack clean drinking water due to saline intrusion and no electricity grid. Requesting deep tube-well community filter and solar inverter.',
    'Kolkata',
    'West Bengal',
    'Gosaba Block, Sundarbans',
    '743370',
    'EQUIPMENT',
    320000,
    'RESOLVED',
    'a0000000-0000-0000-0000-000000000002',
    NULL,
    'b0000000-0000-0000-0000-000000000003',
    'Successfully installed 1,000 LPH RO water filtration plant powered by 3kW solar microgrid. Benefiting 45 households.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    '2025-10-01T10:00:00Z',
    '2026-01-20T17:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    assigned_ngo_id = EXCLUDED.assigned_ngo_id,
    linked_project_id = EXCLUDED.linked_project_id,
    resolution_notes = EXCLUDED.resolution_notes;

-- 11. CASE STATUS HISTORY
INSERT INTO case_status_history (id, help_request_id, status, updated_at, updated_by, note)
VALUES
(
    '70000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'SUBMITTED',
    '2026-03-01T10:30:00Z',
    'Rajesh Mondal',
    'Initial submission'
),
(
    '70000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'UNDER_REVIEW',
    '2026-03-02T11:00:00Z',
    'Platform Admin',
    'Documents checked for completeness'
),
(
    '70000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'VERIFIED',
    '2026-03-03T15:30:00Z',
    'Platform Admin',
    'Hospital medical super verification successful'
),
(
    '70000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'ACCEPTED',
    '2026-03-04T09:00:00Z',
    'Dr. Ananya Sen (Prerona)',
    'Accepted under Pediatric Cardiac Care Initiative'
),
(
    '70000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000001',
    'IN_PROGRESS',
    '2026-03-06T14:00:00Z',
    'Dr. Ananya Sen (Prerona)',
    'Pre-surgery tests scheduled; ₹1,20,000 allocated from project funds'
)
ON CONFLICT (id) DO NOTHING;

-- 12. VOLUNTEER OPPORTUNITIES
INSERT INTO volunteer_opportunities (id, project_id, ngo_id, title, cause, description, location_city, location_state, location_mode, date, duration, skills_required, slots_total, slots_filled, status, requirements)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'Weekend Health Camp Triage & Patient Navigator',
    'healthcare',
    'Assist doctors with patient queue management, basic pulse-oximetry checks, and demographic record-keeping during our riverboat mobile health camp.',
    'Kolkata',
    'West Bengal',
    'ON_FIELD',
    'Every Saturday & Sunday',
    '6 Hours / Day',
    ARRAY['First Aid & Triage', 'Translation (Bengali/Hindi/English)', 'Data Entry & Surveying'],
    10,
    8,
    'OPEN',
    ARRAY['Age 18+', 'Basic conversational Bengali', 'COVID-19 vaccination certificate']
),
(
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'Weekend Python & Scratch Coding Mentor for Girls',
    'education',
    'Conduct fun, hands-on block programming and digital creativity sessions for grade 6-8 girls in Govandi municipal community center.',
    'Mumbai',
    'Maharashtra',
    'ON_FIELD',
    'Saturdays, 10 AM - 1 PM',
    '3 Hours / Week',
    ARRAY['Teaching & Tutoring', 'Photography & Media'],
    15,
    15,
    'FULL',
    ARRAY['Basic programming knowledge', 'Comfortable working with high-school students']
),
(
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'Organic Composting Field Trainer & Soil Tester',
    'environment',
    'Work with self-help groups to demonstrate bio-fertilizer preparation and conduct simple pH testing on salinized farmland plots.',
    'Kolkata',
    'West Bengal',
    'HYBRID',
    'Flexible Bi-Weekly',
    '4 Hours / Visit',
    ARRAY['Field Logistics & Driving', 'Translation (Bengali/Hindi/English)'],
    8,
    5,
    'OPEN',
    ARRAY['Interest in agriculture and environmental sustainability']
)
ON CONFLICT (id) DO UPDATE SET
    slots_filled = EXCLUDED.slots_filled,
    status = EXCLUDED.status;

-- 13. VOLUNTEER APPLICATIONS
INSERT INTO volunteer_applications (id, opportunity_id, volunteer_id, applied_at, status, hours_logged, feedback)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000004',
    '2026-02-10T14:30:00Z',
    'ACCEPTED',
    24,
    'Arjun has been brilliant in keeping the kids engaged with interactive Scratch games.'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004',
    '2026-03-02T09:15:00Z',
    'PENDING',
    0,
    NULL
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    hours_logged = EXCLUDED.hours_logged;

-- 14. DONATIONS
INSERT INTO donations (id, donor_id, project_id, amount, currency, donated_at, receipt_number, payment_method, status, is_anonymous, donor_message)
VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000001',
    50000,
    'INR',
    '2026-02-14T11:20:00Z',
    '80G-PRERONA-2026-0042',
    'UPI / NetBanking',
    'SUCCESSFUL',
    false,
    'Praying for speedy recovery of all little champions in Sundarbans.'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000002',
    75000,
    'INR',
    '2026-03-01T16:45:00Z',
    '80G-VIDYA-2026-0089',
    'Credit Card',
    'SUCCESSFUL',
    false,
    'Dedicated in memory of my grandmother who was a primary school teacher.'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000001',
    750000,
    'INR',
    '2026-01-20T10:00:00Z',
    'CSR-PRERONA-2026-0005',
    'Institutional Wire (RTGS)',
    'SUCCESSFUL',
    false,
    'Schedule VII Grant allocated for Rural Medical Infrastructure.'
)
ON CONFLICT (id) DO NOTHING;

-- 15. FUND UTILIZATIONS
INSERT INTO fund_utilizations (id, project_id, ngo_id, category, amount, description, spent_date, vendor_name, invoice_proof_url, recorded_by)
VALUES
(
    '80000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'MEDICAL_SUPPLIES',
    320000,
    'Procurement of 2 portable echocardiogram probes and surgical stent bundles from Philips Healthcare.',
    '2026-02-05',
    'Philips MedTech Eastern Dist',
    '#',
    'Dr. Ananya Sen'
),
(
    '80000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'LOGISTICS_TRANSPORT',
    145000,
    'Refurbishing hull, solar roof panels, and GPS marine radio for Mobile Clinic Boat-2.',
    '2026-02-18',
    'Canning Boat Builders Guild',
    '#',
    'Dr. Ananya Sen'
),
(
    '80000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'DIRECT_RELIEF',
    180000,
    'Direct hospital surgical fee payment for 2 valve replacements (including Case #case_001 pre-payment).',
    '2026-03-08',
    'NRS Medical College Trust Acct',
    '#',
    'Dr. Ananya Sen'
),
(
    '80000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'EDUCATION_KITS',
    450000,
    '50 touch-enabled tablets and 10 Raspberry Pi 5 server kits preloaded with Maharashtra state curriculum.',
    '2025-10-14',
    'Tech4All Education Solutions',
    '#',
    'Priya Sharma'
)
ON CONFLICT (id) DO NOTHING;

-- 16. AUDIT LOGS
INSERT INTO audit_logs (id, timestamp, actor_id, actor_name, actor_role, action, target_entity, target_id, details)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '2026-03-04T09:00:00Z',
    'a0000000-0000-0000-0000-000000000002',
    'Dr. Ananya Sen',
    'NGO',
    'CASE_ACCEPTED',
    'CASE',
    'c0000000-0000-0000-0000-000000000001',
    'Case accepted and attached to Lifeline Sundarbans project.'
),
(
    '40000000-0000-0000-0000-000000000002',
    '2026-03-08T11:00:00Z',
    'a0000000-0000-0000-0000-000000000002',
    'Dr. Ananya Sen',
    'NGO',
    'FUND_UTILIZATION_RECORDED',
    'PROJECT',
    'b0000000-0000-0000-0000-000000000001',
    'Logged ₹1,80,000 direct hospital surgery expense under Medical Relief.'
),
(
    '40000000-0000-0000-0000-000000000003',
    '2026-01-15T14:30:00Z',
    'a0000000-0000-0000-0000-000000000008',
    'Platform Oversight Officer',
    'ADMIN',
    'NGO_VERIFICATION_STATUS_CHANGED',
    'NGO',
    'a0000000-0000-0000-0000-000000000002',
    'Prerona Rural Relief Mission verified following 12A/80G and CSR-1 registration audit.'
)
ON CONFLICT (id) DO NOTHING;

-- 17. COMPLAINTS
INSERT INTO complaints (id, reporter_id, target_type, target_id, target_title, reason, description, reported_at, status, resolution_note)
VALUES
(
    '50000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004',
    'PROJECT',
    'b0000000-0000-0000-0000-000000000003',
    'Sundarbans Saline Soil Agri-Restoration',
    'Incorrect location coordinates in listing',
    'The location pin initially indicated North 24 Parganas instead of South 24 Parganas Gosaba cluster.',
    '2026-02-20T11:00:00Z',
    'RESOLVED',
    'Coordinates verified and updated with the NGO coordinator.'
)
ON CONFLICT (id) DO NOTHING;

-- 18. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, created_at, is_read)
VALUES
(
    '60000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Case Update: In Progress',
    'Prerona Relief Mission has assigned Dr. Ananya Sen to your medical request.',
    'SUCCESS',
    '2026-03-06T14:05:00Z',
    false
),
(
    '60000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'New Critical Help Request',
    'A critical medical need has been submitted in Kolkata requiring cardiac surgery.',
    'ALERT',
    '2026-03-01T10:35:00Z',
    true
),
(
    '60000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000005',
    'Donation Impact Receipt',
    'Your 80G tax receipt for ₹50,000 to Lifeline Sundarbans is now ready for download.',
    'INFO',
    '2026-02-14T11:21:00Z',
    true
),
(
    '60000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000004',
    'Application Accepted',
    'Vidya Jyoti Foundation accepted your application for the Coding Mentor opportunity.',
    'SUCCESS',
    '2026-02-11T10:00:00Z',
    true
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- NGO Digital Connect - Extended Demo Seed Data
-- Additional realistic demo records for dashboards, search, filters & analytics
-- ==============================================================================


-- ==============================================================================
-- 19. ADDITIONAL PROFILES
-- ==============================================================================

INSERT INTO profiles (
    id, email, role, status, name, phone, city, state, country,
    bio, organization_name, designation, created_at
)
VALUES

(
    'a0000000-0000-0000-0000-000000000009',
    'meera.iyer@example.com',
    'VOLUNTEER',
    'ACTIVE',
    'Meera Iyer',
    '+91 98765 11223',
    'Bengaluru',
    'Karnataka',
    'India',
    'UX designer volunteering for women empowerment and digital literacy initiatives.',
    NULL,
    NULL,
    '2026-01-18T09:30:00Z'
),

(
    'a0000000-0000-0000-0000-000000000010',
    'rahul.verma@example.com',
    'VOLUNTEER',
    'ACTIVE',
    'Rahul Verma',
    '+91 99887 22114',
    'New Delhi',
    'Delhi NCR',
    'India',
    'Engineering graduate interested in environmental restoration and community logistics.',
    NULL,
    NULL,
    '2026-02-05T12:20:00Z'
),

(
    'a0000000-0000-0000-0000-000000000011',
    'neha.kapoor@example.com',
    'DONOR',
    'ACTIVE',
    'Neha Kapoor',
    '+91 98100 77665',
    'Gurugram',
    'Haryana',
    'India',
    'Business professional supporting education and child welfare initiatives.',
    NULL,
    NULL,
    '2025-12-10T15:00:00Z'
),

(
    'a0000000-0000-0000-0000-000000000012',
    'info@sevakiran.org',
    'NGO',
    'ACTIVE',
    'Amit Kulkarni',
    '+91 20 4455 8899',
    'Pune',
    'Maharashtra',
    'India',
    'Working with underserved communities through food security, education and employment programs.',
    'Seva Kiran Foundation',
    'Program Director',
    '2025-05-22T10:00:00Z'
),

(
    'a0000000-0000-0000-0000-000000000013',
    'hello@greenrootsindia.org',
    'NGO',
    'ACTIVE',
    'Kavya Rao',
    '+91 80 3344 5566',
    'Bengaluru',
    'Karnataka',
    'India',
    'Focused on urban sustainability, waste management and ecological restoration.',
    'GreenRoots India',
    'Operations Director',
    '2025-07-12T08:00:00Z'
),

(
    'a0000000-0000-0000-0000-000000000014',
    'sanjay.patel@example.com',
    'BENEFICIARY',
    'ACTIVE',
    'Sanjay Patel',
    '+91 98251 33445',
    'Ahmedabad',
    'Gujarat',
    'India',
    'Small business owner seeking educational assistance for his daughter.',
    NULL,
    NULL,
    '2026-03-05T11:30:00Z'
),

(
    'a0000000-0000-0000-0000-000000000015',
    'farah.khan@example.com',
    'BENEFICIARY',
    'ACTIVE',
    'Farah Khan',
    '+91 97654 77889',
    'Lucknow',
    'Uttar Pradesh',
    'India',
    'Community member seeking livelihood and vocational training support.',
    NULL,
    NULL,
    '2026-03-08T13:15:00Z'
)

ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    bio = EXCLUDED.bio,
    organization_name = EXCLUDED.organization_name,
    designation = EXCLUDED.designation;


-- ==============================================================================
-- 20. ADDITIONAL NGO DETAILS
-- ==============================================================================

INSERT INTO ngo_details (
    id,
    profile_id,
    ngo_id,
    registration_number,
    founded_year,
    mission,
    causes,
    service_areas,
    tax_exemption_80g,
    csr1_number,
    verification_status,
    total_beneficiaries_served,
    active_project_count
)
VALUES

(
    '10000000-0000-0000-0000-000000000070',
    'a0000000-0000-0000-0000-000000000012',
    'ngo_sevakiran_03',
    'MH/2014/0067821',
    2014,
    'Building resilient communities through education, food security and livelihood development.',
    ARRAY['education', 'food_nutrition', 'livelihood'],
    ARRAY['Pune', 'Satara', 'Nashik'],
    true,
    'CSR00033182',
    'VERIFIED',
    31750,
    4
),

(
    '10000000-0000-0000-0000-000000000080',
    'a0000000-0000-0000-0000-000000000013',
    'ngo_greenroots_04',
    'KA/2018/0029184',
    2018,
    'Creating healthier cities through sustainable waste management and ecological restoration.',
    ARRAY['environment', 'sanitation', 'climate'],
    ARRAY['Bengaluru', 'Mysuru', 'Tumakuru'],
    true,
    'CSR00044129',
    'VERIFIED',
    12800,
    3
)

ON CONFLICT (profile_id) DO UPDATE SET
    registration_number = EXCLUDED.registration_number,
    mission = EXCLUDED.mission,
    verification_status = EXCLUDED.verification_status,
    total_beneficiaries_served = EXCLUDED.total_beneficiaries_served,
    active_project_count = EXCLUDED.active_project_count;


-- ==============================================================================
-- 21. ADDITIONAL VOLUNTEER DETAILS
-- ==============================================================================

INSERT INTO volunteer_details (
    id,
    profile_id,
    skills,
    causes,
    availability,
    hours_logged,
    experience_years
)
VALUES

(
    '10000000-0000-0000-0000-000000000090',
    'a0000000-0000-0000-0000-000000000009',
    ARRAY[
        'UI/UX Design',
        'Digital Literacy',
        'Social Media',
        'Workshop Facilitation'
    ],
    ARRAY['education', 'women_children'],
    'WEEKENDS',
    72,
    4
),

(
    '10000000-0000-0000-0000-000000000091',
    'a0000000-0000-0000-0000-000000000010',
    ARRAY[
        'Event Management',
        'Field Logistics',
        'Data Collection',
        'Driving'
    ],
    ARRAY['environment', 'disaster_relief'],
    'FLEXIBLE',
    96,
    5
)

ON CONFLICT (profile_id) DO UPDATE SET
    skills = EXCLUDED.skills,
    causes = EXCLUDED.causes,
    availability = EXCLUDED.availability,
    hours_logged = EXCLUDED.hours_logged,
    experience_years = EXCLUDED.experience_years;


-- ==============================================================================
-- 22. ADDITIONAL DONOR DETAILS
-- ==============================================================================

INSERT INTO donor_details (
    id,
    profile_id,
    preferred_causes,
    tax_pan,
    total_donated,
    is_anonymous_preferred
)
VALUES

(
    '10000000-0000-0000-0000-000000000100',
    'a0000000-0000-0000-0000-000000000011',
    ARRAY['education', 'women_children'],
    'BBBCD5678G',
    285000,
    false
)

ON CONFLICT (profile_id) DO UPDATE SET
    total_donated = EXCLUDED.total_donated;


-- ==============================================================================
-- 23. ADDITIONAL PROJECTS
-- ==============================================================================

INSERT INTO projects (
    id,
    ngo_id,
    title,
    description,
    cause,
    location_city,
    location_state,
    target_beneficiaries,
    reached_beneficiaries,
    start_date,
    end_date,
    funding_target,
    funding_raised,
    volunteers_needed,
    volunteers_enrolled,
    status,
    image_url,
    allow_overfunding
)
VALUES

(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000012',
    'Project Udaan: Digital Skills for First-Generation Learners',
    'Providing affordable digital education, career mentoring and computer access to students from low-income communities.',
    'education',
    'Pune',
    'Maharashtra',
    1200,
    760,
    '2026-01-15',
    '2026-12-15',
    950000,
    625000,
    20,
    13,
    'ACTIVE',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    true
),

(
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000013',
    'Clean Bengaluru: Community Waste Recovery Network',
    'Building decentralized waste segregation and recycling systems across residential communities and schools.',
    'environment',
    'Bengaluru',
    'Karnataka',
    5000,
    3200,
    '2026-02-01',
    '2026-11-30',
    1100000,
    710000,
    40,
    28,
    'ACTIVE',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
    false
),

(
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000012',
    'Poshan Saathi: Community Nutrition Program',
    'Providing nutrition kits, maternal health awareness and child growth monitoring in underserved communities.',
    'food_nutrition',
    'Nashik',
    'Maharashtra',
    1800,
    1210,
    '2025-11-01',
    '2026-10-31',
    700000,
    590000,
    18,
    14,
    'ACTIVE',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    false
),

(
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000013',
    'Lake Revival Bengaluru',
    'Restoring polluted urban lake ecosystems through waste removal, native plantation and community monitoring.',
    'environment',
    'Bengaluru',
    'Karnataka',
    2500,
    2100,
    '2025-04-01',
    '2026-03-31',
    850000,
    850000,
    35,
    35,
    'COMPLETED',
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
    false
)

ON CONFLICT (id) DO UPDATE SET
    funding_raised = EXCLUDED.funding_raised,
    reached_beneficiaries = EXCLUDED.reached_beneficiaries,
    volunteers_enrolled = EXCLUDED.volunteers_enrolled,
    status = EXCLUDED.status;


-- ==============================================================================
-- 24. ADDITIONAL PROJECT MILESTONES
-- ==============================================================================

INSERT INTO project_milestones (
    id,
    project_id,
    title,
    target_date,
    is_completed,
    completed_date,
    notes
)
VALUES

(
    '20000000-0000-0000-0000-000000000009',
    'b0000000-0000-0000-0000-000000000004',
    'Install 25 Community Computer Labs',
    '2026-04-30',
    true,
    '2026-04-21',
    '25 labs established across partner community centers.'
),

(
    '20000000-0000-0000-0000-000000000010',
    'b0000000-0000-0000-0000-000000000004',
    'Train 1,000 Students in Digital Fundamentals',
    '2026-08-31',
    true,
    '2026-08-10',
    '1,130 students completed the introductory curriculum.'
),

(
    '20000000-0000-0000-0000-000000000011',
    'b0000000-0000-0000-0000-000000000005',
    'Deploy 100 Community Waste Collection Points',
    '2026-05-31',
    true,
    '2026-05-24',
    NULL
),

(
    '20000000-0000-0000-0000-000000000012',
    'b0000000-0000-0000-0000-000000000005',
    'Recycle 500 Tons of Community Waste',
    '2026-10-15',
    false,
    NULL,
    'Current recovery volume stands at approximately 340 tons.'
),

(
    '20000000-0000-0000-0000-000000000013',
    'b0000000-0000-0000-0000-000000000006',
    'Distribute 1,500 Nutrition Kits',
    '2026-04-30',
    true,
    '2026-04-26',
    NULL
),

(
    '20000000-0000-0000-0000-000000000014',
    'b0000000-0000-0000-0000-000000000006',
    'Conduct 100 Maternal Health Workshops',
    '2026-09-30',
    false,
    NULL,
    '78 workshops completed so far.'
)

ON CONFLICT (id) DO UPDATE SET
    is_completed = EXCLUDED.is_completed,
    completed_date = EXCLUDED.completed_date;


-- ==============================================================================
-- 25. ADDITIONAL PROJECT UPDATES
-- ==============================================================================

INSERT INTO project_updates (
    id,
    project_id,
    date,
    title,
    content,
    image_url
)
VALUES

(
    '30000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000004',
    '2026-08-15',
    '1,000 Students Complete Digital Skills Program',
    'Students completed modules covering computer fundamentals, online safety, productivity tools and introductory programming.',
    NULL
),

(
    '30000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000005',
    '2026-07-10',
    'Community Recycling Crosses 300 Tons',
    'Local collection centers have recovered more than 300 tons of recyclable material since project launch.',
    NULL
),

(
    '30000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000006',
    '2026-06-20',
    'Nutrition Screening Camp Reaches 500 Children',
    'Community health workers conducted growth assessments and distributed nutrition kits to families requiring support.',
    NULL
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 26. ADDITIONAL HELP REQUESTS
-- ==============================================================================

INSERT INTO help_requests (
    id,
    beneficiary_id,
    title,
    category,
    urgency,
    description,
    location_city,
    location_state,
    location_address,
    location_postal_code,
    required_support_type,
    estimated_cost,
    status,
    assigned_ngo_id,
    assigned_staff_name,
    linked_project_id,
    resolution_notes,
    resolution_evidence_url,
    submitted_at,
    updated_at
)
VALUES

(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000014',
    'Education Support for Class 10 Student',
    'education',
    'HIGH',
    'Request for school fees, textbooks and examination support for a student preparing for Class 10 board examinations.',
    'Ahmedabad',
    'Gujarat',
    'Naroda Community Area',
    '382330',
    'EDUCATION',
    28000,
    'VERIFIED',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-03-12T09:30:00Z',
    '2026-03-14T10:15:00Z'
),

(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000015',
    'Tailoring Training & Starter Kit',
    'livelihood',
    'MEDIUM',
    'Request for vocational tailoring training and basic equipment to establish a home-based livelihood.',
    'Lucknow',
    'Uttar Pradesh',
    'Aliganj Community Cluster',
    '226024',
    'LIVELIHOOD',
    22000,
    'SUBMITTED',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '2026-03-15T14:20:00Z',
    '2026-03-15T14:20:00Z'
),

(
    'c0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000014',
    'Emergency Household Food Support',
    'food_nutrition',
    'CRITICAL',
    'Family temporarily requires essential food supplies following sudden loss of income.',
    'Ahmedabad',
    'Gujarat',
    'Naroda',
    '382330',
    'FOOD',
    8500,
    'IN_PROGRESS',
    'a0000000-0000-0000-0000-000000000012',
    'Amit Kulkarni',
    NULL,
    NULL,
    NULL,
    '2026-03-17T08:00:00Z',
    '2026-03-17T12:30:00Z'
)

ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    assigned_ngo_id = EXCLUDED.assigned_ngo_id,
    assigned_staff_name = EXCLUDED.assigned_staff_name,
    updated_at = EXCLUDED.updated_at;


-- ==============================================================================
-- 27. ADDITIONAL VOLUNTEER OPPORTUNITIES
-- ==============================================================================

INSERT INTO volunteer_opportunities (
    id,
    project_id,
    ngo_id,
    title,
    cause,
    description,
    location_city,
    location_state,
    location_mode,
    date,
    duration,
    skills_required,
    slots_total,
    slots_filled,
    status,
    requirements
)
VALUES

(
    'd0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000012',
    'Digital Literacy Mentor',
    'education',
    'Help students learn basic computer skills, online safety and productivity tools.',
    'Pune',
    'Maharashtra',
    'ON_FIELD',
    'Every Sunday',
    '4 Hours / Week',
    ARRAY['Teaching & Tutoring', 'Digital Literacy'],
    20,
    11,
    'OPEN',
    ARRAY['Basic computer knowledge', 'Good communication skills']
),

(
    'd0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000013',
    'Community Waste Audit Volunteer',
    'environment',
    'Assist field teams in collecting waste segregation data from residential communities.',
    'Bengaluru',
    'Karnataka',
    'HYBRID',
    'Flexible',
    '5 Hours / Week',
    ARRAY['Data Collection', 'Field Logistics'],
    12,
    7,
    'OPEN',
    ARRAY['Interest in sustainability', 'Ability to work outdoors']
),

(
    'd0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000012',
    'Nutrition Camp Coordinator',
    'food_nutrition',
    'Support registration, queue management and community awareness during nutrition camps.',
    'Nashik',
    'Maharashtra',
    'ON_FIELD',
    'Selected Saturdays',
    '5 Hours / Day',
    ARRAY['Event Management', 'Communication'],
    10,
    4,
    'OPEN',
    ARRAY['Age 18+', 'Comfortable interacting with families']
),

(
    'd0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000013',
    'Lake Cleanup Volunteer',
    'environment',
    'Join community cleanup and native plantation activities around the restored lake.',
    'Bengaluru',
    'Karnataka',
    'ON_FIELD',
    'First Sunday of Every Month',
    '4 Hours',
    ARRAY['Field Logistics'],
    50,
    50,
    'FULL',
    ARRAY['Basic outdoor fitness', 'Reusable water bottle required']
)

ON CONFLICT (id) DO UPDATE SET
    slots_filled = EXCLUDED.slots_filled,
    status = EXCLUDED.status;


-- ==============================================================================
-- 28. ADDITIONAL VOLUNTEER APPLICATIONS
-- ==============================================================================

INSERT INTO volunteer_applications (
    id,
    opportunity_id,
    volunteer_id,
    applied_at,
    status,
    hours_logged,
    feedback
)
VALUES

(
    'e0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000009',
    '2026-03-01T10:00:00Z',
    'ACCEPTED',
    16,
    'Excellent communication skills and strong understanding of digital learning.'
),

(
    'e0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000010',
    '2026-03-05T12:15:00Z',
    'ACCEPTED',
    20,
    'Strong field coordination and data collection skills.'
),

(
    'e0000000-0000-0000-0000-000000000005',
    'd0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000009',
    '2026-03-10T09:45:00Z',
    'PENDING',
    0,
    NULL
),

(
    'e0000000-0000-0000-0000-000000000006',
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000004',
    '2026-03-12T16:00:00Z',
    'REJECTED',
    0,
    'Opportunity requires weekday availability.'
)

ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    hours_logged = EXCLUDED.hours_logged;


-- ==============================================================================
-- 29. ADDITIONAL DONATIONS
-- ==============================================================================

INSERT INTO donations (
    id,
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
)
VALUES

(
    'f0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000011',
    'b0000000-0000-0000-0000-000000000004',
    50000,
    'INR',
    '2026-02-20T12:30:00Z',
    '80G-UDAAN-2026-0017',
    'UPI',
    'SUCCESSFUL',
    false,
    'Every child deserves access to technology and opportunity.'
),

(
    'f0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000011',
    'b0000000-0000-0000-0000-000000000006',
    35000,
    'INR',
    '2026-03-03T14:10:00Z',
    '80G-POSHAN-2026-0024',
    'Credit Card',
    'SUCCESSFUL',
    false,
    'Supporting healthier communities.'
),

(
    'f0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000005',
    450000,
    'INR',
    '2026-02-15T09:00:00Z',
    'CSR-GREEN-2026-0011',
    'Institutional Wire (RTGS)',
    'SUCCESSFUL',
    false,
    'Community sustainability grant.'
),

(
    'f0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000005',
    25000,
    'INR',
    '2026-03-09T18:30:00Z',
    '80G-GREEN-2026-0032',
    'UPI',
    'SUCCESSFUL',
    false,
    'For a cleaner and greener Bengaluru.'
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 30. ADDITIONAL FUND UTILIZATIONS
-- ==============================================================================

INSERT INTO fund_utilizations (
    id,
    project_id,
    ngo_id,
    category,
    amount,
    description,
    spent_date,
    vendor_name,
    invoice_proof_url,
    recorded_by
)
VALUES

(
    '80000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000012',
    'EDUCATION_KITS',
    185000,
    'Procurement of refurbished laptops, routers and learning accessories for community computer labs.',
    '2026-03-01',
    'Community Tech Supplies Pvt Ltd',
    '#',
    'Amit Kulkarni'
),

(
    '80000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000013',
    'ENVIRONMENTAL_EQUIPMENT',
    210000,
    'Procurement of segregation bins, weighing equipment and recycling collection infrastructure.',
    '2026-03-05',
    'EcoServe Equipment India',
    '#',
    'Kavya Rao'
),

(
    '80000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000012',
    'DIRECT_RELIEF',
    125000,
    'Nutrition kits and essential food supplies distributed through community health centers.',
    '2026-03-07',
    'Seva Community Distribution Network',
    '#',
    'Amit Kulkarni'
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 31. ADDITIONAL CASE STATUS HISTORY
-- ==============================================================================

INSERT INTO case_status_history (
    id,
    help_request_id,
    status,
    updated_at,
    updated_by,
    note
)
VALUES

(
    '70000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000004',
    'SUBMITTED',
    '2026-03-12T09:30:00Z',
    'Sanjay Patel',
    'Education support request submitted.'
),

(
    '70000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000004',
    'UNDER_REVIEW',
    '2026-03-13T11:15:00Z',
    'Platform Admin',
    'Student documentation is being reviewed.'
),

(
    '70000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000004',
    'VERIFIED',
    '2026-03-14T10:15:00Z',
    'Platform Admin',
    'Education documents verified.'
),

(
    '70000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000006',
    'SUBMITTED',
    '2026-03-17T08:00:00Z',
    'Sanjay Patel',
    'Emergency food assistance request submitted.'
),

(
    '70000000-0000-0000-0000-000000000007',
    'c0000000-0000-0000-0000-000000000006',
    'ACCEPTED',
    '2026-03-17T11:00:00Z',
    'Amit Kulkarni',
    'Emergency food assistance accepted by Seva Kiran Foundation.'
),

(
    '70000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000006',
    'IN_PROGRESS',
    '2026-03-17T12:30:00Z',
    'Amit Kulkarni',
    'Food package preparation and delivery initiated.'
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 32. ADDITIONAL COMPLAINTS
-- ==============================================================================

INSERT INTO complaints (
    id,
    reporter_id,
    target_type,
    target_id,
    target_title,
    reason,
    description,
    reported_at,
    status,
    resolution_note
)
VALUES

(
    '50000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000010',
    'PROJECT',
    'b0000000-0000-0000-0000-000000000005',
    'Clean Bengaluru: Community Waste Recovery Network',
    'Incorrect project information',
    'The initial listing displayed an outdated volunteer meeting location.',
    '2026-03-01T10:30:00Z',
    'RESOLVED',
    'Project coordinator confirmed and corrected the meeting location.'
),

(
    '50000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000009',
    'OPPORTUNITY',
    'd0000000-0000-0000-0000-000000000006',
    'Nutrition Camp Coordinator',
    'Schedule clarification required',
    'Volunteer requested clarification regarding exact camp dates.',
    '2026-03-10T15:20:00Z',
    'UNDER_REVIEW',
    NULL
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 33. ADDITIONAL NOTIFICATIONS
-- ==============================================================================

INSERT INTO notifications (
    id,
    user_id,
    title,
    message,
    type,
    created_at,
    is_read
)
VALUES

(
    '60000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000009',
    'Volunteer Application Accepted',
    'Your application for Digital Literacy Mentor has been accepted by Seva Kiran Foundation.',
    'SUCCESS',
    '2026-03-02T10:00:00Z',
    false
),

(
    '60000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000010',
    'Volunteer Application Accepted',
    'Your application for Community Waste Audit Volunteer has been accepted.',
    'SUCCESS',
    '2026-03-06T09:30:00Z',
    true
),

(
    '60000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000011',
    'Donation Successful',
    'Your donation of ₹50,000 to Project Udaan was successfully processed.',
    'SUCCESS',
    '2026-02-20T12:35:00Z',
    true
),

(
    '60000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000012',
    'New Help Request',
    'A new emergency food assistance request has been submitted and requires review.',
    'ALERT',
    '2026-03-17T08:05:00Z',
    false
),

(
    '60000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000013',
    'Project Milestone Completed',
    'The Clean Bengaluru project has completed its 100 community collection point milestone.',
    'SUCCESS',
    '2026-05-24T17:00:00Z',
    true
),

(
    '60000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000008',
    'Platform Activity Alert',
    'Multiple new NGO projects and help requests were added to the platform.',
    'INFO',
    '2026-03-17T18:00:00Z',
    false
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 34. ADDITIONAL AUDIT LOGS
-- ==============================================================================

INSERT INTO audit_logs (
    id,
    timestamp,
    actor_id,
    actor_name,
    actor_role,
    action,
    target_entity,
    target_id,
    details
)
VALUES

(
    '40000000-0000-0000-0000-000000000004',
    '2026-03-02T10:00:00Z',
    'a0000000-0000-0000-0000-000000000012',
    'Amit Kulkarni',
    'NGO',
    'VOLUNTEER_APPLICATION_ACCEPTED',
    'VOLUNTEER_APPLICATION',
    'e0000000-0000-0000-0000-000000000003',
    'Volunteer accepted for Digital Literacy Mentor opportunity.'
),

(
    '40000000-0000-0000-0000-000000000005',
    '2026-03-05T12:30:00Z',
    'a0000000-0000-0000-0000-000000000013',
    'Kavya Rao',
    'NGO',
    'PROJECT_UPDATE_CREATED',
    'PROJECT',
    'b0000000-0000-0000-0000-000000000005',
    'Project team published a new community recycling progress update.'
),

(
    '40000000-0000-0000-0000-000000000006',
    '2026-03-17T11:00:00Z',
    'a0000000-0000-0000-0000-000000000012',
    'Amit Kulkarni',
    'NGO',
    'CASE_ACCEPTED',
    'CASE',
    'c0000000-0000-0000-0000-000000000006',
    'Emergency food assistance case accepted for immediate support.'
),

(
    '40000000-0000-0000-0000-000000000007',
    '2026-03-17T12:30:00Z',
    'a0000000-0000-0000-0000-000000000012',
    'Amit Kulkarni',
    'NGO',
    'FUND_UTILIZATION_RECORDED',
    'PROJECT',
    'b0000000-0000-0000-0000-000000000006',
    'Nutrition support expenditure recorded against Poshan Saathi project.'
)

ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 35. EXTRA DEMO NOTIFICATION FOR ADMIN DASHBOARD
-- ==============================================================================

INSERT INTO notifications (
    id,
    user_id,
    title,
    message,
    type,
    created_at,
    is_read
)
VALUES
(
    '60000000-0000-0000-0000-000000000011',
    'a0000000-0000-0000-0000-000000000008',
    'Verification Queue Updated',
    '2 NGO profiles are awaiting verification review.',
    'ALERT',
    '2026-03-18T09:00:00Z',
    false
)
ON CONFLICT (id) DO NOTHING;