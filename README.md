# NGO-Digital-Connect
### An Integrated, Traceable Platform for the Social Impact Ecosystem

**NGO Digital Connect** unites beneficiaries in need, accredited non-profits, volunteers, individual donors, CSR institutions, and government monitoring agencies into a single verifiable lifecycle:

$$\textbf{NEED} \longrightarrow \textbf{ACTION} \longrightarrow \textbf{IMPACT}$$

---

## 🌟 Key Product Capabilities

1. **Public Discovery Surface**
   - **Ecosystem Home**: Visualizes the Need $\rightarrow$ Action $\rightarrow$ Impact journey, live calculated metrics, and featured initiatives.
   - **Verified NGO Directory**: Faceted filtering by cause focus, operating state, and 12A/80G accreditation badges.
   - **Multi-Metric Project Catalog**: Tracks capital raised, volunteer enrollment, and direct beneficiaries reached in real-time.
   - **Volunteer Opportunities Hub**: Real-time capacity-capped volunteer slot discovery with direct one-click application.
   - **Global Impact Ledger**: Calculated ecosystem outcomes computed dynamically from live database records.

2. **Beneficiary Intake & Protection (Strict PII Privacy)**
   - **AI-Assisted Natural Language Intake**: Automatically infers cause category, support type, and urgency level from citizen descriptions.
   - **Status-Driven Tracker**: Step-by-step progress tracking (*Submitted $\rightarrow$ Under Review $\rightarrow$ Verified $\rightarrow$ Matched $\rightarrow$ Accepted $\rightarrow$ In Progress $\rightarrow$ Resolved*).
   - **Caseworker Channel**: Private, scoped communication between beneficiary and assigned NGO caseworker.
   - **Zero Public PII**: Contact numbers, street addresses, and medical certificates remain strictly confidential.

3. **NGO Operations Hub**
   - **Triage Inbox**: Review incoming help requests filtered by critical priority and geographic proximity.
   - **Project Builder & Milestones**: Deploy multi-metric social initiatives with verifiable field milestones.
   - **Audited Expense Utilization Ledger**: Itemize expenditures against remaining project balances with vendor references.
   - **Volunteer Coordination Desk**: Accept/decline volunteer applications without over-allocation and log verified service hours.
   - **AI Operations Copilot**: Instant natural language queries for underfunded projects, unaddressed urgent cases, and volunteer capacities.
   - **Statutory Impact Dossier Generator**: One-click printable executive impact reports for institutional partners.

4. **Volunteer Mobilization Engine**
   - Profile indexing for verified skills and availability.
   - Smart AI matching scoring openings against volunteer competencies.
   - Track accepted assignments, attendance, and accredited service hours.

5. **Philanthropic Donor Suite**
   - Project discovery by cause and geography.
   - Interactive contribution checkout with real-time project wallet allocation.
   - **Certified Section 80G Tax Receipts Vault**: Instantly generate and print tax-deductible certificates.
   - Itemized fund utilization visibility.

6. **Institutional CSR Suite (MCA Section 135 Compliant)**
   - Schedule VII statutory cause filters.
   - Multi-lakh grant commitments tied directly to active field projects.
   - Audited expenditure tables for corporate social responsibility filings.

7. **Government & Institutional Monitoring Suite**
   - Macro-level district social density analytics across major Indian states.
   - Welfare non-duplication check: cross-referencing regional needs to avoid double allocation of public welfare.
   - Accredited non-profit roster in regional jurisdiction.

8. **Platform Trust & Administration Suite**
   - **NGO KYC Accreditation Desk**: Review pending non-profit registrations, inspect 12A/80G and CSR-1 numbers, and grant the Verified Trust Badge.
   - **Content Moderation & Dispute Desk**: Investigate community complaints and enforce community standards.
   - **Immutable Audit Trail Explorer**: Searchable, append-only chronological log of all platform operations.

---

## 🚀 Running the Application

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **npm** or **pnpm**

### 2. Development Server
Clone or navigate to the project directory and run:

```bash
npm run dev
```

Open your browser at `http://localhost:5173` to explore the application.

### 3. Production Build
Verify TypeScript type checks and produce minified production bundles:

```bash
npm run build
```

---

## 👥 Demo Personas (1-Click Switcher Available in Top Bar)

The application includes pre-configured realistic accounts across all 7 stakeholder roles. You can instantly switch between them using the top-bar demo switcher or sign in using their registered email:

| Stakeholder Role | Persona Name | Registered Email | Focus / Context |
|---|---|---|---|
| **Beneficiary** | Rajesh Mondal | `rajesh.mondal@example.com` | Daily wage artisan seeking urgent pediatric heart surgery support |
| **NGO Director** | Dr. Ananya Sen | `contact@preronamission.org` | Prerona Relief Mission (Sundarbans Healthcare & Disaster Relief) |
| **NGO Director** | Priya Sharma | `director@vidyajyoti.org` | Vidya Jyoti Foundation (Solar Smart Classrooms in Mumbai Slums) |
| **Volunteer** | Arjun Mehta | `arjun.mehta@example.com` | Weekend STEM educator & field triage volunteer |
| **Donor** | Kavita Deshmukh | `kavita.deshmukh@example.com` | Tech entrepreneur funding child healthcare & digital literacy |
| **CSR Lead** | Vikramaditya Oberoi | `csr@tatanetworks.com` | Tata Networks CSR Foundation (Schedule VII Grant Allocations) |
| **Government Nodal** | Debashis Mukherjee, IAS | `dm.kolkata@wb.gov.in` | Department of Social Welfare & Disaster Management |
| **Platform Admin** | Platform Oversight | `admin@ngodigitalconnect.org` | Chief Compliance, KYC Accreditation & Moderation Lead |

---

## 📁 Architecture & File Structure

```
src/
├── types/
│   └── models.ts             # Complete TypeScript domain schemas, lifecycles, and DTOs
├── data/
│   ├── seedData.ts           # Populated multi-tenant demonstration records
│   └── causes.ts             # Causes taxonomy, Indian states/cities, and skill tags
├── store/
│   ├── AuthContext.tsx       # Authentication session, fast role switching, and RBAC
│   └── DataContext.tsx       # Central state machine, relational persistence, and audit logging
├── services/
│   ├── aiService.ts          # NLP intake classification, smart matching, and NGO copilot
│   └── storageService.ts     # LocalStorage / Mock DB persistence engine
├── components/
│   ├── common/
│   │   ├── Icons.tsx         # Comprehensive Lucide-style SVG icon set
│   │   ├── Header.tsx        # Navigation, persona switcher bar, and live notification drawer
│   │   ├── Footer.tsx        # Transparency footer, privacy guarantee, and seed reset button
│   │   ├── Badge.tsx         # Universal status and urgency badge component
│   │   └── ProgressBar.tsx   # Multi-metric visualizer (funds, volunteers, beneficiaries)
│   └── ai/
│       └── NgoAssistantModal.tsx # Interactive AI Copilot for NGO operations
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx      # Landing page, core journey visualizer, and dynamic statistics
│   │   ├── NgoDirectoryPage.tsx # Verified directory with faceted search and compliance filters
│   │   ├── NgoDetailPage.tsx # Public NGO dossier, statutory accreditations, and active initiatives
│   │   ├── ProjectDirectoryPage.tsx # Project catalog with multi-metric balance scorecards
│   │   ├── ProjectDetailPage.tsx # Deep dive with audited utilization ledger and 80G donation modal
│   │   ├── OpportunitiesPage.tsx # Capacity-enforced volunteer opportunities and one-click apply
│   │   ├── ImpactPage.tsx    # Calculated ecosystem metrics and real-time public audit ledger
│   │   ├── LoginPage.tsx     # Unified login with 1-click persona launcher
│   │   └── RegisterPage.tsx  # "Who are you?" interactive 6-role onboarding questionnaire
│   └── portals/
│       ├── BeneficiaryPortal.tsx # Case intake wizard, live stage tracker, and caseworker channel
│       ├── NgoPortal.tsx     # Inbound triage desk, project builder, expense logger, and volunteer desk
│       ├── VolunteerPortal.tsx # Roster, applied assignments, and AI-recommended opportunities
│       ├── DonorPortal.tsx   # 80G tax receipt vault, portfolio tracker, and milestone updates
│       ├── CsrPortal.tsx     # Schedule VII compliance grant manager and corporate audit feed
│       ├── GovernmentPortal.tsx # Regional density heatmap, district coverage, and non-duplication review
│       └── AdminPortal.tsx   # NGO KYC accreditation, moderation desk, and platform audit explorer
├── App.tsx                   # Master router connecting all public pages and role portals
└── index.css                 # Clean, responsive CSS design system
```

---

## 🔒 Security & Privacy Guarantees

1. **Beneficiary Seclusion (Rule 101)**: Sensitive personal information (private residential address, contact number, personal medical diagnosis PDFs) is strictly hidden from guest visitors, donors, volunteers, and institutional visitors. Only the assigned verified NGO case officer has decrypted access.
2. **Deterministic Volunteer Capacity (Rule 102)**: No opportunity can accept more volunteers than its defined quota. The UI dynamically locks once slots are filled.
3. **No Unanchored Capital (Rule 103)**: Every financial contribution must link to an active `ProjectID` with a defined funding goal. Slush funds are strictly prohibited.
4. **Itemized Fund Utilization (Rule 104)**: NGOs can only record funds as utilized when accompanied by an expenditure category, vendor name, amount, and invoice reference.
5. **Immutable Audit Trajectory (Rule 105)**: Every critical transition across cases, donations, and accreditation status writes to an append-only audit log.
