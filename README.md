NGO-Digital-Connect

An Integrated, Traceable Platform for the Social Impact Ecosystem

NGO Digital Connect unites beneficiaries in need, accredited non-profits, volunteers, individual donors, CSR institutions, and government monitoring agencies into a single verifiable lifecycle:

$$\textbf{NEED} \longrightarrow \textbf{ACTION} \longrightarrow \textbf{IMPACT}$$

⸻

🌟 Key Product Capabilities

1. Public Discovery Surface

* Ecosystem Home: Visualizes the Need → Action → Impact journey, live calculated metrics, and featured initiatives.
* Verified NGO Directory: Faceted filtering by cause focus, operating state, and 12A/80G accreditation badges.
* Multi-Metric Project Catalog: Tracks capital raised, volunteer enrollment, and direct beneficiaries reached in real time.
* Volunteer Opportunities Hub: Real-time capacity-capped volunteer slot discovery with direct one-click application.
* Global Impact Ledger: Calculated ecosystem outcomes computed dynamically from live database records.

2. Beneficiary Intake & Protection

* AI-Assisted Natural Language Intake: Automatically infers cause category, support type, and urgency level from citizen descriptions.
* Status-Driven Tracker: Step-by-step progress tracking:
    Submitted → Under Review → Verified → Matched → Accepted → In Progress → Resolved
* Caseworker Channel: Private, scoped communication between beneficiaries and assigned NGO caseworkers.
* Zero Public PII: Contact numbers, street addresses, and medical certificates remain strictly confidential.

3. NGO Operations Hub

* Triage Inbox: Review incoming help requests filtered by critical priority and geographic proximity.
* Project Builder & Milestones: Deploy multi-metric social initiatives with verifiable field milestones.
* Audited Expense Utilization Ledger: Itemize expenditures against remaining project balances with vendor references.
* Volunteer Coordination Desk: Accept or decline volunteer applications without over-allocation and log verified service hours.
* AI Operations Copilot: Natural-language queries for underfunded projects, unaddressed urgent cases, and volunteer capacities.
* Statutory Impact Dossier Generator: One-click printable executive impact reports for institutional partners.

4. Volunteer Mobilization Engine

* Profile indexing for verified skills and availability.
* Smart AI matching that scores opportunities against volunteer competencies.
* Track accepted assignments, attendance, and accredited service hours.

5. Philanthropic Donor Suite

* Project discovery by cause and geography.
* Interactive contribution checkout with project-level fund allocation.
* 80G Tax Receipt Vault: Generate and print tax-deductible contribution certificates.
* Itemized fund utilization visibility.
* Donation and contribution history tracking.

6. Institutional CSR Suite

* Schedule VII statutory cause filters.
* Grant commitments tied directly to active field projects.
* Audited expenditure tables for corporate social responsibility reporting.
* Project-level CSR impact tracking.

7. Government & Institutional Monitoring Suite

* Macro-level district social-density analytics across major Indian states.
* Welfare non-duplication checks to help identify overlapping regional needs.
* Accredited non-profit roster organized by regional jurisdiction.
* District-level project and beneficiary visibility.

8. Platform Trust & Administration Suite

* NGO KYC Accreditation Desk: Review pending non-profit registrations, inspect 12A/80G and CSR-1 information, and grant the Verified Trust Badge.
* Content Moderation & Dispute Desk: Investigate community complaints and enforce platform standards.
* Immutable Audit Trail Explorer: Searchable chronological log of platform operations.

⸻

🚀 Running the Application

1. Prerequisites

* Node.js: v18+ or v20+
* npm or pnpm

2. Development Server

Clone or navigate to the project directory and run:

npm install
npm run dev

Open your browser at:

http://localhost:5173

3. Production Build

Run the production build to verify TypeScript compilation and generate optimized bundles:

npm run build

⸻

👥 Demo Personas

The application includes pre-configured demonstration accounts across the major stakeholder roles. You can instantly switch between personas using the top-bar demo switcher or sign in using their registered email.

Stakeholder Role	Persona Name	Registered Email	Focus / Context
Beneficiary	Rajesh Mondal	rajesh.mondal@example.com	Daily wage artisan seeking urgent pediatric heart surgery support
NGO Director	Dr. Ananya Sen	contact@preronamission.org	Prerona Relief Mission — Sundarbans healthcare & disaster relief
NGO Director	Priya Sharma	director@vidyajyoti.org	Vidya Jyoti Foundation — solar smart classrooms
Volunteer	Arjun Mehta	arjun.mehta@example.com	Weekend STEM educator & field triage volunteer
Donor	Kavita Deshmukh	kavita.deshmukh@example.com	Technology entrepreneur supporting child healthcare & digital literacy
CSR Lead	Vikramaditya Oberoi	csr@tatanetworks.com	Tata Networks CSR Foundation — Schedule VII grant allocations
Government Nodal	Debashis Mukherjee, IAS	dm.kolkata@wb.gov.in	Department of Social Welfare & Disaster Management
Platform Admin	Platform Oversight	admin@ngodigitalconnect.org	Compliance, KYC accreditation & moderation

⸻

👥 Live Demo

🔗 ngo-digital-connect.vercel.app

🌐 Visit Website →

⸻

📁 Architecture & File Structure

src/
├── types/
│   └── models.ts
│       # Complete TypeScript domain schemas,
│       # lifecycles, and DTOs
│
├── data/
│   ├── seedData.ts
│   │   # Populated multi-tenant demonstration records
│   └── causes.ts
│       # Causes taxonomy, Indian states/cities,
│       # and skill tags
│
├── store/
│   ├── AuthContext.tsx
│   │   # Authentication session, role switching,
│   │   # and RBAC
│   └── DataContext.tsx
│       # Central application state, relational
│       # persistence, and audit logging
│
├── services/
│   ├── aiService.ts
│   │   # NLP intake classification,
│   │   # smart matching, and NGO copilot
│   └── storageService.ts
│       # Application persistence layer
│
├── components/
│   ├── common/
│   │   ├── Icons.tsx
│   │   │   # Comprehensive SVG icon set
│   │   ├── Header.tsx
│   │   │   # Navigation, persona switcher,
│   │   │   # and notification drawer
│   │   ├── Footer.tsx
│   │   │   # Transparency footer and privacy information
│   │   ├── Badge.tsx
│   │   │   # Universal status and urgency badge
│   │   └── ProgressBar.tsx
│   │       # Multi-metric visualizer
│   │
│   └── ai/
│       └── NgoAssistantModal.tsx
│           # Interactive AI Copilot
│
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx
│   │   │   # Landing page and dynamic statistics
│   │   ├── NgoDirectoryPage.tsx
│   │   │   # Verified NGO directory
│   │   ├── NgoDetailPage.tsx
│   │   │   # Public NGO profile and initiatives
│   │   ├── ProjectDirectoryPage.tsx
│   │   │   # Project catalog
│   │   ├── ProjectDetailPage.tsx
│   │   │   # Project details and contribution interface
│   │   ├── OpportunitiesPage.tsx
│   │   │   # Volunteer opportunities
│   │   ├── ImpactPage.tsx
│   │   │   # Ecosystem metrics and public audit ledger
│   │   ├── LoginPage.tsx
│   │   │   # Unified login and persona launcher
│   │   └── RegisterPage.tsx
│   │       # Multi-role onboarding
│   │
│   └── portals/
│       ├── BeneficiaryPortal.tsx
│       │   # Case intake, tracking, and caseworker channel
│       ├── NgoPortal.tsx
│       │   # Triage, projects, expenses, and volunteers
│       ├── VolunteerPortal.tsx
│       │   # Assignments and recommended opportunities
│       ├── DonorPortal.tsx
│       │   # Contribution history, receipts, and milestones
│       ├── CsrPortal.tsx
│       │   # CSR grant management and reporting
│       ├── GovernmentPortal.tsx
│       │   # Regional analytics and welfare monitoring
│       └── AdminPortal.tsx
│           # KYC, moderation, and audit management
│
├── App.tsx
│   # Master router connecting public pages and portals
│
└── index.css
    # Responsive CSS design system

⸻

🔒 Security & Privacy Guarantees

Rule 101 — Beneficiary Seclusion

Sensitive personal information such as private residential addresses, contact numbers, and medical documentation is restricted from public visitors, donors, volunteers, and institutional users.

Access is limited according to the application’s role-based access controls.

Rule 102 — Deterministic Volunteer Capacity

No volunteer opportunity can accept more volunteers than its defined capacity. The interface dynamically locks applications once available slots are filled.

Rule 103 — Project-Linked Contributions

Financial contributions are associated with active projects with defined funding goals. Contributions are represented against the relevant project rather than as unassigned platform funds.

Rule 104 — Itemized Fund Utilization

NGOs can record project expenditure using structured information such as expenditure category, vendor name, amount, and invoice reference.

Rule 105 — Audit Trajectory

Critical platform operations, including case transitions, contribution records, and accreditation changes, are recorded in the application’s audit trail.

⸻

💳 Contribution & Payment Interface

NGO Digital Connect includes dedicated contribution and payment pages that allow donors to:

* Browse active social-impact projects.
* Review project funding progress.
* Select a contribution amount.
* Review the contribution before submission.
* Associate contributions with specific projects.
* View contribution history.
* Access applicable contribution receipt information.

The current application provides the payment and contribution user interface as part of the donor experience.

Payment-provider-specific backend integrations, recurring subscription infrastructure, payment webhooks, and external payment dashboards are not part of the current application architecture.

⸻

🧠 AI-Powered Features

The platform incorporates AI-assisted functionality across multiple workflows:

* Beneficiary Intake Classification
    * Identifies likely cause category.
    * Identifies support type.
    * Estimates urgency from submitted descriptions.
* Volunteer Matching
    * Compares volunteer skills and availability with opportunity requirements.
    * Produces relevant opportunity recommendations.
* NGO Operations Copilot
    * Helps identify underfunded projects.
    * Surfaces urgent unresolved cases.
    * Provides volunteer-capacity insights.
    * Supports natural-language operational queries.

These features are designed to assist platform users while keeping core decisions and actions within the application’s role-based workflows.

⸻

🗃️ Data & Application State

The application uses structured domain models and centralized application state to manage:

* User profiles
* NGO information
* Beneficiary cases
* Projects
* Project milestones
* Contributions
* Volunteer opportunities
* Volunteer applications
* Service hours
* CSR initiatives
* Government monitoring data
* Accreditation records
* Audit records
* Notifications

The application is designed around role-based access and structured lifecycle management across the social-impact ecosystem.

⸻

🔄 Core Lifecycle

The platform connects the major stages of a social-impact workflow:

                    ┌─────────────────┐
                    │      NEED       │
                    │                 │
                    │ Beneficiary     │
                    │ Intake          │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     ACTION      │
                    │                 │
                    │ NGO Response    │
                    │ Volunteers      │
                    │ Donations       │
                    │ CSR Support     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     IMPACT      │
                    │                 │
                    │ Milestones      │
                    │ Beneficiaries   │
                    │ Service Hours   │
                    │ Fund Utilization│
                    │ Audit Trail     │
                    └─────────────────┘

⸻

🛡️ Role-Based Access

The application separates functionality according to stakeholder roles:

Role	Primary Capabilities
Beneficiary	Submit cases, track requests, communicate with assigned caseworkers
NGO	Manage cases, projects, volunteers, expenses, and impact
Volunteer	Discover opportunities, apply, track assignments and service hours
Donor	Discover projects, make contributions, track impact and receipts
CSR	Review projects, manage grants, monitor CSR impact
Government	Monitor regional needs, projects, and institutional coverage
Admin	Manage accreditation, moderation, compliance, and audit records

⸻

📊 Impact Tracking

The platform provides dynamic visibility into social-impact activity through metrics such as:

* Total beneficiaries reached
* Active projects
* Funds raised
* Funds utilized
* Volunteer participation
* Verified service hours
* Resolved beneficiary cases
* NGO participation
* CSR initiatives
* Regional project coverage

These metrics are derived from the application’s underlying records and are presented through the public and institutional dashboards.

⸻

🎯 Project Vision

NGO Digital Connect aims to create a transparent digital ecosystem where:

Beneficiaries
      ↓
Verified Needs
      ↓
NGOs + Volunteers + Donors + CSR
      ↓
Tracked Action
      ↓
Verified Impact
      ↓
Transparent Reporting

The goal is to connect stakeholders, improve visibility into social-impact initiatives, and create a traceable journey from need to measurable impact.

⸻

👥 Demo

🔗 Live Application:
https://ngo-digital-connect.vercel.app

⸻

📌 Project Status

NGO Digital Connect is a demonstration platform showcasing an integrated digital workflow for beneficiaries, NGOs, volunteers, donors, CSR institutions, government stakeholders, and platform administrators.

The project focuses on:

* Social-impact discovery
* Beneficiary case management
* NGO operations
* Volunteer coordination
* Donor contributions
* CSR project management
* Institutional monitoring
* AI-assisted workflows
* Privacy-aware data handling
* Auditability and transparency
* Impact measurement

⸻
