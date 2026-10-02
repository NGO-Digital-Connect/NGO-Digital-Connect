import type {
  UserAccount,
  HelpRequest,
  Project,
  VolunteerOpportunity,
  VolunteerApplication,
  Donation,
  FundUtilization,
  AuditLog,
  ComplaintReport,
  NotificationItem,
  DirectMessage
} from '../types/models';
import {
  SEED_USERS,
  SEED_CASES,
  SEED_PROJECTS,
  SEED_OPPORTUNITIES,
  SEED_APPLICATIONS,
  SEED_DONATIONS,
  SEED_UTILIZATIONS,
  SEED_AUDIT_LOGS,
  SEED_COMPLAINTS,
  SEED_NOTIFICATIONS
} from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'ngo_digi_users_v1',
  CURRENT_USER: 'ngo_digi_current_user_v1',
  CASES: 'ngo_digi_cases_v1',
  PROJECTS: 'ngo_digi_projects_v1',
  OPPORTUNITIES: 'ngo_digi_opportunities_v1',
  APPLICATIONS: 'ngo_digi_applications_v1',
  DONATIONS: 'ngo_digi_donations_v1',
  UTILIZATIONS: 'ngo_digi_utilizations_v1',
  AUDIT_LOGS: 'ngo_digi_audit_logs_v1',
  COMPLAINTS: 'ngo_digi_complaints_v1',
  NOTIFICATIONS: 'ngo_digi_notifications_v1',
  MESSAGES: 'ngo_digi_messages_v1'
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  getUsers: (): UserAccount[] => getItem(STORAGE_KEYS.USERS, SEED_USERS),
  saveUsers: (users: UserAccount[]) => setItem(STORAGE_KEYS.USERS, users),

  getCurrentUser: (): UserAccount => getItem(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]),
  saveCurrentUser: (user: UserAccount) => setItem(STORAGE_KEYS.CURRENT_USER, user),

  getCases: (): HelpRequest[] => getItem(STORAGE_KEYS.CASES, SEED_CASES),
  saveCases: (cases: HelpRequest[]) => setItem(STORAGE_KEYS.CASES, cases),

  getProjects: (): Project[] => getItem(STORAGE_KEYS.PROJECTS, SEED_PROJECTS),
  saveProjects: (projects: Project[]) => setItem(STORAGE_KEYS.PROJECTS, projects),

  getOpportunities: (): VolunteerOpportunity[] => getItem(STORAGE_KEYS.OPPORTUNITIES, SEED_OPPORTUNITIES),
  saveOpportunities: (opps: VolunteerOpportunity[]) => setItem(STORAGE_KEYS.OPPORTUNITIES, opps),

  getApplications: (): VolunteerApplication[] => getItem(STORAGE_KEYS.APPLICATIONS, SEED_APPLICATIONS),
  saveApplications: (apps: VolunteerApplication[]) => setItem(STORAGE_KEYS.APPLICATIONS, apps),

  getDonations: (): Donation[] => getItem(STORAGE_KEYS.DONATIONS, SEED_DONATIONS),
  saveDonations: (donations: Donation[]) => setItem(STORAGE_KEYS.DONATIONS, donations),

  getUtilizations: (): FundUtilization[] => getItem(STORAGE_KEYS.UTILIZATIONS, SEED_UTILIZATIONS),
  saveUtilizations: (utils: FundUtilization[]) => setItem(STORAGE_KEYS.UTILIZATIONS, utils),

  getAuditLogs: (): AuditLog[] => getItem(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS),
  saveAuditLogs: (logs: AuditLog[]) => setItem(STORAGE_KEYS.AUDIT_LOGS, logs),

  getComplaints: (): ComplaintReport[] => getItem(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS),
  saveComplaints: (complaints: ComplaintReport[]) => setItem(STORAGE_KEYS.COMPLAINTS, complaints),

  getNotifications: (): NotificationItem[] => getItem(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS),
  saveNotifications: (notifs: NotificationItem[]) => setItem(STORAGE_KEYS.NOTIFICATIONS, notifs),

  getMessages: (): DirectMessage[] => getItem(STORAGE_KEYS.MESSAGES, []),
  saveMessages: (msgs: DirectMessage[]) => setItem(STORAGE_KEYS.MESSAGES, msgs),

  resetAllData: () => {
    localStorage.clear();
    setItem(STORAGE_KEYS.USERS, SEED_USERS);
    setItem(STORAGE_KEYS.CURRENT_USER, SEED_USERS[0]);
    setItem(STORAGE_KEYS.CASES, SEED_CASES);
    setItem(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    setItem(STORAGE_KEYS.OPPORTUNITIES, SEED_OPPORTUNITIES);
    setItem(STORAGE_KEYS.APPLICATIONS, SEED_APPLICATIONS);
    setItem(STORAGE_KEYS.DONATIONS, SEED_DONATIONS);
    setItem(STORAGE_KEYS.UTILIZATIONS, SEED_UTILIZATIONS);
    setItem(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    setItem(STORAGE_KEYS.COMPLAINTS, SEED_COMPLAINTS);
    setItem(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    setItem(STORAGE_KEYS.MESSAGES, []);
  }
};
