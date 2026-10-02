export type UserRole = 
  | 'BENEFICIARY' 
  | 'NGO' 
  | 'VOLUNTEER' 
  | 'DONOR' 
  | 'CSR' 
  | 'GOVERNMENT' 
  | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  avatar?: string;
  profile: UserProfile;
}

export interface UserProfile {
  name: string;
  phone?: string;
  city: string;
  state: string;
  country: string;
  bio?: string;
  organizationName?: string;
  designation?: string;
  // Role specific extensions
  ngoDetails?: NgoDetails;
  volunteerDetails?: VolunteerDetails;
  donorDetails?: DonorDetails;
  csrDetails?: CsrDetails;
  governmentDetails?: GovernmentDetails;
}

export type NgoVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface NgoDetails {
  ngoId: string;
  registrationNumber: string;
  foundedYear: number;
  mission: string;
  causes: string[];
  serviceAreas: string[];
  taxExemption80G: boolean;
  csr1Number?: string;
  verificationStatus: NgoVerificationStatus;
  verificationDocuments?: {
    type: string;
    url: string;
    submittedAt: string;
  }[];
  totalBeneficiariesServed: number;
  activeProjectCount: number;
}

export interface VolunteerDetails {
  skills: string[];
  causes: string[];
  availability: 'WEEKDAYS' | 'WEEKENDS' | 'FLEXIBLE' | 'FULL_TIME';
  hoursLogged: number;
  experienceYears?: number;
}

export interface DonorDetails {
  preferredCauses: string[];
  taxPan?: string;
  totalDonated: number;
  isAnonymousPreferred: boolean;
}

export interface CsrDetails {
  companyName: string;
  cinNumber?: string;
  annualBudget: number;
  focusStates: string[];
  preferredCauses: string[];
  grantsCommitted: number;
}

export interface GovernmentDetails {
  department: string;
  officialJurisdiction: string;
  designation: string;
  authorizedIdNumber: string;
}

export type CaseUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus = 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'MATCHED' 
  | 'ACCEPTED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED' 
  | 'REJECTED' 
  | 'ON_HOLD' 
  | 'CANCELLED';

export interface HelpRequest {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string; // Redacted publicly
  contactPhone?: string;   // Redacted publicly
  title: string;
  category: string;
  urgency: CaseUrgency;
  description: string;
  location: {
    city: string;
    state: string;
    address?: string; // Private
    postalCode?: string;
  };
  requiredSupportType: 'FINANCIAL' | 'MEDICAL' | 'FOOD_RATION' | 'EDUCATION' | 'SHELTER' | 'EQUIPMENT' | 'VOLUNTEER_HELP';
  estimatedCost?: number;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  status: CaseStatus;
  assignedNgoId?: string;
  assignedNgoName?: string;
  assignedStaffName?: string;
  linkedProjectId?: string;
  resolutionNotes?: string;
  resolutionEvidenceUrl?: string;
  submittedAt: string;
  updatedAt: string;
  statusHistory: {
    status: CaseStatus;
    updatedAt: string;
    updatedBy: string;
    note?: string;
  }[];
}

export type ProjectStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface ProjectMilestone {
  id: string;
  title: string;
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string;
  evidenceUrl?: string;
  notes?: string;
}

export interface Project {
  id: string;
  ngoId: string;
  ngoName: string;
  title: string;
  description: string;
  cause: string;
  location: {
    city: string;
    state: string;
  };
  targetBeneficiaries: number;
  reachedBeneficiaries: number;
  startDate: string;
  endDate: string;
  fundingTarget: number;
  fundingRaised: number;
  volunteersNeeded: number;
  volunteersEnrolled: number;
  status: ProjectStatus;
  milestones: ProjectMilestone[];
  imageUrl: string;
  updates: {
    id: string;
    date: string;
    title: string;
    content: string;
    imageUrl?: string;
  }[];
  allowOverfunding?: boolean;
}

export interface VolunteerOpportunity {
  id: string;
  projectId: string;
  projectTitle: string;
  ngoId: string;
  ngoName: string;
  title: string;
  cause: string;
  description: string;
  location: {
    city: string;
    state: string;
    mode: 'ON_FIELD' | 'REMOTE' | 'HYBRID';
  };
  date: string;
  duration: string;
  skillsRequired: string[];
  slotsTotal: number;
  slotsFilled: number;
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
  requirements: string[];
}

export interface VolunteerApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  volunteerId: string;
  volunteerName: string;
  ngoId: string;
  appliedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  hoursLogged?: number;
  feedback?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  projectId: string;
  projectTitle: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  currency: string;
  donatedAt: string;
  receiptNumber: string;
  paymentMethod: string;
  status: 'SUCCESSFUL' | 'PROCESSING' | 'REFUNDED';
  isAnonymous: boolean;
  donorMessage?: string;
}

export type ExpenseCategory = 
  | 'DIRECT_RELIEF' 
  | 'MEDICAL_SUPPLIES' 
  | 'FOOD_PROVISIONS' 
  | 'EDUCATION_KITS' 
  | 'LOGISTICS_TRANSPORT' 
  | 'FIELD_EQUIPMENT' 
  | 'SHELTER_MATERIALS';

export interface FundUtilization {
  id: string;
  projectId: string;
  ngoId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  spentDate: string;
  vendorName: string;
  invoiceProofUrl?: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetEntity: 'CASE' | 'PROJECT' | 'DONATION' | 'OPPORTUNITY' | 'NGO' | 'USER';
  targetId: string;
  details: string;
}

export interface ComplaintReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'PROJECT' | 'NGO' | 'USER' | 'CASE';
  targetId: string;
  targetTitle: string;
  reason: string;
  description: string;
  reportedAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  resolutionNote?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface DirectMessage {
  id: string;
  caseId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
}

export interface GlobalImpactMetrics {
  peopleHelped: number;
  casesResolved: number;
  projectsCompleted: number;
  activeProjects: number;
  volunteersEngaged: number;
  volunteerHoursLogged: number;
  totalFundsUtilized: number;
  totalFundsRaised: number;
  communitiesReached: number;
  causesSupported: number;
}
