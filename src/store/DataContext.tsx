import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  HelpRequest,
  Project,
  VolunteerOpportunity,
  VolunteerApplication,
  Donation,
  FundUtilization,
  AuditLog,
  ComplaintReport,
  NotificationItem,
  GlobalImpactMetrics,
  CaseStatus,
  CaseUrgency,
  NgoVerificationStatus,
  DirectMessage,
  UserAccount,
} from '../types/models';
import { StorageService } from '../services/storageService';
import { SupabaseService } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
}

interface DataContextType {
  // Loading & Sync States
  isLoading: boolean;
  isSyncing: boolean;
  activeToast: ToastMessage | null;
  dismissToast: () => void;

  // State Collections
  cases: HelpRequest[];
  projects: Project[];
  opportunities: VolunteerOpportunity[];
  applications: VolunteerApplication[];
  donations: Donation[];
  utilizations: FundUtilization[];
  auditLogs: AuditLog[];
  complaints: ComplaintReport[];
  notifications: NotificationItem[];
  messages: DirectMessage[];
  globalMetrics: GlobalImpactMetrics;
  allUsers: UserAccount[];

  // Case Actions
  submitHelpRequest: (data: {
    title: string;
    category: string;
    urgency: CaseUrgency;
    description: string;
    city: string;
    state: string;
    address?: string;
    postalCode?: string;
    requiredSupportType: HelpRequest['requiredSupportType'];
    estimatedCost?: number;
    documents?: { name: string; url: string; type: string }[];
  }) => Promise<HelpRequest>;

  updateCaseStatus: (caseId: string, status: CaseStatus, note?: string) => Promise<void>;
  assignCaseNgo: (caseId: string, ngoId: string, ngoName: string) => Promise<void>;
  linkCaseToProject: (caseId: string, projectId: string) => Promise<void>;
  resolveCase: (caseId: string, notes: string, evidenceUrl?: string) => Promise<void>;

  // Project Actions
  createProject: (projectData: Omit<Project, 'id' | 'fundingRaised' | 'reachedBeneficiaries' | 'volunteersEnrolled' | 'milestones' | 'updates'>) => Project;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addProjectUpdate: (projectId: string, title: string, content: string, imageUrl?: string) => void;

  // Volunteer Actions
  createOpportunity: (oppData: Omit<VolunteerOpportunity, 'id' | 'slotsFilled' | 'status'>) => VolunteerOpportunity;
  applyForOpportunity: (opportunityId: string) => Promise<{ success: boolean; message: string }>;
  updateApplicationStatus: (applicationId: string, status: VolunteerApplication['status']) => Promise<void>;
  logVolunteerHours: (applicationId: string, hours: number) => Promise<void>;

  // Donation & Funding Actions
  makeDonation: (data: {
    projectId: string;
    amount: number;
    paymentMethod: string;
    isAnonymous: boolean;
    donorMessage?: string;
  }) => Promise<Donation>;

  // Transparency & Utilization Actions
  logFundUtilization: (data: Omit<FundUtilization, 'id' | 'recordedBy'>) => Promise<{ success: boolean; message: string }>;

  // Governance & Admin Actions
  updateNgoVerification: (ngoUserId: string, status: NgoVerificationStatus) => void;
  submitComplaint: (data: Omit<ComplaintReport, 'id' | 'reportedAt' | 'status' | 'reporterId' | 'reporterName'>) => void;
  resolveComplaint: (complaintId: string, resolutionNote: string) => void;

  // Communication & Notifications
  sendMessage: (receiverId: string, receiverName: string, content: string, caseId?: string) => Promise<DirectMessage>;
  markNotificationRead: (notificationId: string) => void;
  resetAllPlatformData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  // Initialize with StorageService cache for instant render without flash
  const [cases, setCases] = useState<HelpRequest[]>(() => StorageService.getCases());
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>(() => StorageService.getOpportunities());
  const [applications, setApplications] = useState<VolunteerApplication[]>(() => StorageService.getApplications());
  const [donations, setDonations] = useState<Donation[]>(() => StorageService.getDonations());
  const [utilizations, setUtilizations] = useState<FundUtilization[]>(() => StorageService.getUtilizations());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [complaints, setComplaints] = useState<ComplaintReport[]>(() => StorageService.getComplaints());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [messages, setMessages] = useState<DirectMessage[]>(() => StorageService.getMessages());

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const triggerToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'INFO') => {
    const toast: ToastMessage = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
    };
    setActiveToast(toast);
    setTimeout(() => {
      setActiveToast(current => (current?.id === toast.id ? null : current));
    }, 5000);
  }, []);

  // 1. Fetch live PostgreSQL data on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPlatformData = async () => {
      try {
        setIsLoading(true);
        const [
          dbCases,
          dbProjects,
          dbOpps,
          dbApps,
          dbDonations,
          dbUtils,
          dbLogs,
          dbComplaints,
          dbNotifs,
          dbMsgs
        ] = await Promise.all([
          SupabaseService.getCases(),
          SupabaseService.getProjects(),
          SupabaseService.getOpportunities(),
          SupabaseService.getApplications(),
          SupabaseService.getDonations(),
          SupabaseService.getUtilizations(),
          SupabaseService.getAuditLogs(),
          SupabaseService.getComplaints(),
          SupabaseService.getNotifications(),
          SupabaseService.getMessages()
        ]);

        if (isMounted) {
          if (dbCases && dbCases.length > 0) setCases(dbCases);
          if (dbProjects && dbProjects.length > 0) setProjects(dbProjects);
          if (dbOpps && dbOpps.length > 0) setOpportunities(dbOpps);
          if (dbApps && dbApps.length > 0) setApplications(dbApps);
          if (dbDonations && dbDonations.length > 0) setDonations(dbDonations);
          if (dbUtils && dbUtils.length > 0) setUtilizations(dbUtils);
          if (dbLogs && dbLogs.length > 0) setAuditLogs(dbLogs);
          if (dbComplaints && dbComplaints.length > 0) setComplaints(dbComplaints);
          if (dbNotifs && dbNotifs.length > 0) setNotifications(dbNotifs);
          if (dbMsgs) setMessages(dbMsgs);
        }
      } catch (err) {
        console.error('[DataContext] Error initializing live Supabase data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPlatformData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Setup Realtime PostgreSQL Subscriptions across all tables
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    const dataChannel = supabase
      .channel('realtime_platform_stream')
      // Help requests / cases (INSERT, UPDATE, DELETE)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'help_requests' },
        async (payload: any) => {
          console.log('[Realtime] help_requests changed:', payload.eventType, payload.new?.id || payload.old?.id);
          if (!isMounted) return;

          if (payload.eventType === 'INSERT') {
            const freshCases = await SupabaseService.getCases();
            if (isMounted) setCases(freshCases);
          } else if (payload.eventType === 'UPDATE') {
            setCases(prev =>
              prev.map(c => (c.id === payload.new.id ? { ...c, ...payload.new, status: payload.new.status } : c))
            );
            // Refresh with full relational joins in background
            SupabaseService.getCases().then(fc => {
              if (isMounted) setCases(fc);
            });
          } else if (payload.eventType === 'DELETE') {
            setCases(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      // Direct messages (Instant realtime chat between Beneficiary and NGO)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload: any) => {
          console.log('[Realtime] new direct_message:', payload.new?.id);
          if (!isMounted || !payload.new) return;

          const newMsgId = payload.new.id;
          const freshMsg: DirectMessage = {
            id: payload.new.id,
            caseId: payload.new.case_id,
            senderId: payload.new.sender_id,
            senderName: payload.new.sender_id === currentUser.id ? currentUser.profile.name : 'Participant',
            senderRole: payload.new.sender_id === currentUser.id ? currentUser.role : 'NGO',
            receiverId: payload.new.receiver_id,
            receiverName: payload.new.receiver_id === currentUser.id ? currentUser.profile.name : 'Recipient',
            content: payload.new.content,
            timestamp: payload.new.timestamp,
          };

          setMessages(prev => {
            if (prev.some(m => m.id === newMsgId)) return prev;
            return [...prev, freshMsg];
          });

          // If current user is the receiver, show real-time toast
          if (payload.new.receiver_id === currentUser.id) {
            triggerToast('New Message Received', freshMsg.content, 'INFO');
          }

          // Hydrate sender details in background
          SupabaseService.getMessages().then(ms => {
            if (isMounted) setMessages(ms);
          });
        }
      )
      // Realtime Notifications
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload: any) => {
          if (!isMounted) return;
          console.log('[Realtime] notification change:', payload.eventType, payload.new?.id);

          if (payload.eventType === 'INSERT' && payload.new) {
            const notif: NotificationItem = {
              id: payload.new.id,
              userId: payload.new.user_id,
              title: payload.new.title,
              message: payload.new.message,
              type: payload.new.type,
              createdAt: payload.new.created_at,
              isRead: payload.new.is_read,
              actionUrl: payload.new.action_url,
            };

            setNotifications(prev => {
              if (prev.some(n => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });

            // Trigger UI toast for the recipient
            if (payload.new.user_id === currentUser.id) {
              triggerToast(notif.title, notif.message, notif.type);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setNotifications(prev =>
              prev.map(n => (n.id === payload.new.id ? { ...n, isRead: payload.new.is_read } : n))
            );
          }
        }
      )
      // Volunteer Applications
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteer_applications' },
        () => {
          if (!isMounted) return;
          SupabaseService.getApplications().then(apps => {
            if (isMounted) setApplications(apps);
          });
          SupabaseService.getOpportunities().then(opps => {
            if (isMounted) setOpportunities(opps);
          });
        }
      )
      // Volunteer Opportunities
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteer_opportunities' },
        () => {
          if (!isMounted) return;
          SupabaseService.getOpportunities().then(opps => {
            if (isMounted) setOpportunities(opps);
          });
        }
      )
      // Donations
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        () => {
          if (!isMounted) return;
          SupabaseService.getDonations().then(dons => {
            if (isMounted) setDonations(dons);
          });
          SupabaseService.getProjects().then(projs => {
            if (isMounted) setProjects(projs);
          });
        }
      )
      // Fund Utilizations
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fund_utilizations' },
        () => {
          if (!isMounted) return;
          SupabaseService.getUtilizations().then(utils => {
            if (isMounted) setUtilizations(utils);
          });
        }
      )
      // Projects
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          if (!isMounted) return;
          SupabaseService.getProjects().then(projs => {
            if (isMounted) setProjects(projs);
          });
        }
      )
      .subscribe((status: string) => {
        console.log('[DataContext] Realtime subscription status:', status);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(dataChannel);
    };
  }, [currentUser.id, triggerToast]);

  // Sync to local cache buffer for fast offline view
  useEffect(() => { StorageService.saveCases(cases); }, [cases]);
  useEffect(() => { StorageService.saveProjects(projects); }, [projects]);
  useEffect(() => { StorageService.saveOpportunities(opportunities); }, [opportunities]);
  useEffect(() => { StorageService.saveApplications(applications); }, [applications]);
  useEffect(() => { StorageService.saveDonations(donations); }, [donations]);
  useEffect(() => { StorageService.saveUtilizations(utilizations); }, [utilizations]);
  useEffect(() => { StorageService.saveAuditLogs(auditLogs); }, [auditLogs]);
  useEffect(() => { StorageService.saveComplaints(complaints); }, [complaints]);
  useEffect(() => { StorageService.saveNotifications(notifications); }, [notifications]);
  useEffect(() => { StorageService.saveMessages(messages); }, [messages]);

  const logAudit = useCallback((
    action: string,
    targetEntity: AuditLog['targetEntity'],
    targetId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.profile.name,
      actorRole: currentUser.role,
      action,
      targetEntity,
      targetId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Persist to Supabase
    SupabaseService.insertAuditLog({
      timestamp: newLog.timestamp,
      actorId: currentUser.id,
      actorName: currentUser.profile.name,
      actorRole: currentUser.role,
      action,
      targetEntity,
      targetId,
      details
    });
  }, [currentUser]);

  const pushNotification = useCallback((userId: string, title: string, message: string, type: NotificationItem['type'] = 'INFO') => {
    const notif: NotificationItem = {
      id: crypto.randomUUID(),
      userId,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);

    if (userId === currentUser.id) {
      triggerToast(title, message, type);
    }

    // Persist to Supabase database so recipient receives via Realtime
    SupabaseService.insertNotification(notif);
  }, [currentUser.id, triggerToast]);

  // 1. Help Request Intake (Real database insertion)
  const submitHelpRequest = async (data: {
    title: string;
    category: string;
    urgency: CaseUrgency;
    description: string;
    city: string;
    state: string;
    address?: string;
    postalCode?: string;
    requiredSupportType: HelpRequest['requiredSupportType'];
    estimatedCost?: number;
    documents?: { name: string; url: string; type: string }[];
  }): Promise<HelpRequest> => {
    setIsSyncing(true);
    try {
      const generatedId = crypto.randomUUID();
      const newCaseData: Omit<HelpRequest, 'id'> & { id?: string } = {
        id: generatedId,
        beneficiaryId: currentUser.id,
        beneficiaryName: currentUser.profile.name,
        contactPhone: currentUser.profile.phone,
        title: data.title,
        category: data.category,
        urgency: data.urgency,
        description: data.description,
        location: {
          city: data.city,
          state: data.state,
          address: data.address,
          postalCode: data.postalCode
        },
        requiredSupportType: data.requiredSupportType,
        estimatedCost: data.estimatedCost || 0,
        documents: data.documents || [],
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'SUBMITTED',
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.profile.name,
            note: 'Need expressed and entered into platform intake queue.'
          }
        ]
      };

      // Persist to Supabase PostgreSQL and get real database record
      const dbRecord = await SupabaseService.createCase(newCaseData);

      setCases(prev => [dbRecord, ...prev.filter(c => c.id !== dbRecord.id)]);
      logAudit('CASE_SUBMITTED', 'CASE', dbRecord.id, `New help request submitted with urgency ${data.urgency}`);

      pushNotification(
        currentUser.id,
        'Request Registered',
        `Your help request #${dbRecord.id.slice(0, 8)} has been securely submitted and queued for verification.`,
        'SUCCESS'
      );

      allUsers
        .filter(u => u.role === 'NGO')
        .forEach(ngoUser => {
          pushNotification(
            ngoUser.id,
            `Inbound Request [${data.urgency}]`,
            `New ${data.category} request logged in ${data.city}.`,
            data.urgency === 'CRITICAL' ? 'ALERT' : 'INFO'
          );
        });

      return dbRecord;
    } catch (err: any) {
      console.error('[DataContext] submitHelpRequest failed:', err);
      triggerToast('Request Submission Error', err.message || 'Could not save case.', 'ALERT');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Case Status Transition
  const updateCaseStatus = async (caseId: string, status: CaseStatus, note?: string): Promise<void> => {
    setIsSyncing(true);
    try {
      setCases(prev =>
        prev.map(c => {
          if (c.id !== caseId) return c;
          const newHistory = [
            ...c.statusHistory,
            {
              status,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser.profile.name,
              note: note || `Status updated to ${status}`
            }
          ];
          return {
            ...c,
            status,
            updatedAt: new Date().toISOString(),
            statusHistory: newHistory
          };
        })
      );

      logAudit('CASE_STATUS_CHANGED', 'CASE', caseId, `Case transitioned to ${status}. Note: ${note || 'None'}`);

      const targetCase = cases.find(c => c.id === caseId);
      if (targetCase) {
        pushNotification(
          targetCase.beneficiaryId,
          `Case Status: ${status}`,
          `Your request #${caseId.slice(0, 8)} has moved to "${status}".`,
          'INFO'
        );
      }

      await SupabaseService.updateCaseStatus(caseId, status, currentUser.profile.name, note);
    } catch (err) {
      console.error('[DataContext] updateCaseStatus error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Assign Case to NGO
  const assignCaseNgo = async (caseId: string, ngoId: string, ngoName: string): Promise<void> => {
    setIsSyncing(true);
    try {
      setCases(prev =>
        prev.map(c => {
          if (c.id !== caseId) return c;
          return {
            ...c,
            assignedNgoId: ngoId,
            assignedNgoName: ngoName,
            status: 'ACCEPTED',
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...c.statusHistory,
              {
                status: 'ACCEPTED',
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.profile.name,
                note: `Assigned and accepted by ${ngoName}`
              }
            ]
          };
        })
      );

      logAudit('CASE_ASSIGNED', 'CASE', caseId, `Assigned to NGO ${ngoName}`);

      const targetCase = cases.find(c => c.id === caseId);
      if (targetCase) {
        pushNotification(
          targetCase.beneficiaryId,
          'Caseworker Assigned',
          `${ngoName} has accepted your help request into care.`,
          'SUCCESS'
        );
      }

      await SupabaseService.assignCaseNgo(caseId, ngoId, ngoName, currentUser.profile.name);
    } catch (err) {
      console.error('[DataContext] assignCaseNgo error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Link Case to Project
  const linkCaseToProject = async (caseId: string, projectId: string): Promise<void> => {
    setIsSyncing(true);
    try {
      const project = projects.find(p => p.id === projectId);
      setCases(prev =>
        prev.map(c => {
          if (c.id !== caseId) return c;
          return {
            ...c,
            linkedProjectId: projectId,
            status: 'IN_PROGRESS',
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...c.statusHistory,
              {
                status: 'IN_PROGRESS',
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.profile.name,
                note: `Connected to project: "${project?.title || projectId}"`
              }
            ]
          };
        })
      );

      logAudit('CASE_LINKED_TO_PROJECT', 'CASE', caseId, `Attached to project ${projectId}`);
      await SupabaseService.linkCaseToProject(caseId, projectId, currentUser.profile.name, project?.title);
    } catch (err) {
      console.error('[DataContext] linkCaseToProject error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Resolve Case
  const resolveCase = async (caseId: string, notes: string, evidenceUrl?: string): Promise<void> => {
    setIsSyncing(true);
    try {
      const targetCase = cases.find(c => c.id === caseId);
      setCases(prev =>
        prev.map(c => {
          if (c.id !== caseId) return c;
          return {
            ...c,
            status: 'RESOLVED',
            resolutionNotes: notes,
            resolutionEvidenceUrl: evidenceUrl,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...c.statusHistory,
              {
                status: 'RESOLVED',
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.profile.name,
                note: `Case resolved: ${notes}`
              }
            ]
          };
        })
      );

      if (targetCase?.linkedProjectId) {
        setProjects(prev =>
          prev.map(p => {
            if (p.id !== targetCase.linkedProjectId) return p;
            return {
              ...p,
              reachedBeneficiaries: p.reachedBeneficiaries + 1
            };
          })
        );
      }

      logAudit('CASE_RESOLVED', 'CASE', caseId, `Resolution recorded with outcome notes.`);
      if (targetCase) {
        pushNotification(
          targetCase.beneficiaryId,
          'Case Successfully Resolved',
          `Your help request has been resolved by ${targetCase.assignedNgoName || 'the assigned NGO'}.`,
          'SUCCESS'
        );
      }

      await SupabaseService.resolveCase(caseId, notes, evidenceUrl, currentUser.profile.name, currentUser.id);
    } catch (err) {
      console.error('[DataContext] resolveCase error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 6. Create Project
  const createProject = (projectData: Omit<Project, 'id' | 'fundingRaised' | 'reachedBeneficiaries' | 'volunteersEnrolled' | 'milestones' | 'updates'>): Project => {
    const newProjectId = crypto.randomUUID();
    const newProject: Project = {
      ...projectData,
      id: newProjectId,
      fundingRaised: 0,
      reachedBeneficiaries: 0,
      volunteersEnrolled: 0,
      milestones: [
        {
          id: crypto.randomUUID(),
          title: 'Initiative Kickoff & Community Survey',
          targetDate: projectData.startDate,
          isCompleted: false
        },
        {
          id: crypto.randomUUID(),
          title: 'Full Resource Deployment & Midterm Review',
          targetDate: projectData.endDate,
          isCompleted: false
        }
      ],
      updates: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString().split('T')[0],
          title: 'Project Initiated',
          content: `${projectData.title} was officially published on NGO Digital Connect.`
        }
      ]
    };

    setProjects(prev => [newProject, ...prev]);
    logAudit('PROJECT_CREATED', 'PROJECT', newProjectId, `Project "${projectData.title}" created with budget target ₹${projectData.fundingTarget}`);

    // Persist to Supabase
    setIsSyncing(true);
    SupabaseService.createProject(newProject).finally(() => setIsSyncing(false));

    return newProject;
  };

  // 7. Toggle Milestone
  const toggleMilestone = (projectId: string, milestoneId: string) => {
    let nextCompleted = false;
    let compDate: string | undefined = undefined;

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const updatedMilestones = p.milestones.map(m => {
          if (m.id !== milestoneId) return m;
          nextCompleted = !m.isCompleted;
          compDate = nextCompleted ? new Date().toISOString().split('T')[0] : undefined;
          return {
            ...m,
            isCompleted: nextCompleted,
            completedDate: compDate
          };
        });
        return {
          ...p,
          milestones: updatedMilestones
        };
      })
    );

    logAudit('PROJECT_MILESTONE_UPDATED', 'PROJECT', projectId, `Milestone ${milestoneId} updated`);

    // Persist to Supabase
    setIsSyncing(true);
    SupabaseService.toggleMilestone(milestoneId, nextCompleted, compDate).finally(() => setIsSyncing(false));
  };

  // 8. Add Project Update
  const addProjectUpdate = (projectId: string, title: string, content: string, imageUrl?: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          updates: [
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString().split('T')[0],
              title,
              content,
              imageUrl
            },
            ...p.updates
          ]
        };
      })
    );

    logAudit('PROJECT_UPDATE_POSTED', 'PROJECT', projectId, `New project update: "${title}"`);

    // Persist to Supabase
    setIsSyncing(true);
    SupabaseService.addProjectUpdate(projectId, title, content, imageUrl).finally(() => setIsSyncing(false));
  };

  // 9. Create Opportunity
  const createOpportunity = (oppData: Omit<VolunteerOpportunity, 'id' | 'slotsFilled' | 'status'>): VolunteerOpportunity => {
    const newOppId = crypto.randomUUID();
    const newOpp: VolunteerOpportunity = {
      ...oppData,
      id: newOppId,
      slotsFilled: 0,
      status: 'OPEN'
    };

    setOpportunities(prev => [newOpp, ...prev]);
    logAudit('OPPORTUNITY_CREATED', 'OPPORTUNITY', newOppId, `Opportunity "${oppData.title}" created with ${oppData.slotsTotal} slots.`);

    // Persist to Supabase
    setIsSyncing(true);
    SupabaseService.createOpportunity(newOpp).finally(() => setIsSyncing(false));

    return newOpp;
  };

  // 10. Apply for Opportunity (Concurrency safe with row locks)
  const applyForOpportunity = async (opportunityId: string): Promise<{ success: boolean; message: string }> => {
    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) return { success: false, message: 'Opportunity not found.' };

    if (opp.slotsFilled >= opp.slotsTotal) {
      return { success: false, message: 'Capacity full! No additional slots available for this opportunity.' };
    }

    const existing = applications.find(a => a.opportunityId === opportunityId && a.volunteerId === currentUser.id);
    if (existing) {
      return { success: false, message: 'You have already submitted an application for this opportunity.' };
    }

    setIsSyncing(true);
    try {
      const res = await SupabaseService.applyForOpportunity(opportunityId, currentUser.id);
      if (res.success) {
        const newApp: VolunteerApplication = {
          id: crypto.randomUUID(),
          opportunityId,
          opportunityTitle: opp.title,
          volunteerId: currentUser.id,
          volunteerName: currentUser.profile.name,
          ngoId: opp.ngoId,
          appliedAt: new Date().toISOString(),
          status: 'PENDING'
        };
        setApplications(prev => [newApp, ...prev]);
        logAudit('VOLUNTEER_APPLIED', 'OPPORTUNITY', opportunityId, `Volunteer ${currentUser.profile.name} applied for "${opp.title}"`);

        pushNotification(
          opp.ngoId,
          'New Volunteer Application',
          `${currentUser.profile.name} applied for "${opp.title}".`,
          'INFO'
        );
      }
      return res;
    } catch (e: any) {
      return { success: false, message: e.message || 'Application failed.' };
    } finally {
      setIsSyncing(false);
    }
  };

  // 11. Update Application Status
  const updateApplicationStatus = async (applicationId: string, status: VolunteerApplication['status']) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    setIsSyncing(true);
    try {
      setApplications(prev =>
        prev.map(a => (a.id === applicationId ? { ...a, status } : a))
      );

      if (status === 'ACCEPTED') {
        setOpportunities(prev =>
          prev.map(o => {
            if (o.id !== app.opportunityId) return o;
            const nextFilled = o.slotsFilled + 1;
            return {
              ...o,
              slotsFilled: nextFilled,
              status: nextFilled >= o.slotsTotal ? 'FULL' : 'OPEN'
            };
          })
        );

        pushNotification(
          app.volunteerId,
          'Application Accepted!',
          `Your application for "${app.opportunityTitle}" was approved! Check your briefing details.`,
          'SUCCESS'
        );
      }

      logAudit('VOLUNTEER_APP_STATUS_CHANGED', 'OPPORTUNITY', app.opportunityId, `Application ${applicationId} status updated to ${status}`);
      await SupabaseService.updateApplicationStatus(applicationId, status, currentUser.id, currentUser.profile.name);
    } finally {
      setIsSyncing(false);
    }
  };

  // 12. Log Volunteer Hours
  const logVolunteerHours = async (applicationId: string, hours: number) => {
    setIsSyncing(true);
    try {
      setApplications(prev =>
        prev.map(a => (a.id === applicationId ? { ...a, hoursLogged: (a.hoursLogged || 0) + hours, status: 'COMPLETED' } : a))
      );
      logAudit('VOLUNTEER_HOURS_LOGGED', 'OPPORTUNITY', applicationId, `Logged ${hours} verified service hours.`);
      await SupabaseService.logVolunteerHours(applicationId, hours);
    } finally {
      setIsSyncing(false);
    }
  };

  // 13. Make Donation (Authoritative database confirmation)
  const makeDonation = async (data: {
    projectId: string;
    amount: number;
    paymentMethod: string;
    isAnonymous: boolean;
    donorMessage?: string;
  }): Promise<Donation> => {
    const project = projects.find(p => p.id === data.projectId);
    if (!project) throw new Error('Project not found');

    const receiptNo = `80G-${project.ngoName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    setIsSyncing(true);
    try {
      const dbDonation = await SupabaseService.makeDonation({
        donorId: currentUser.id,
        projectId: data.projectId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        isAnonymous: data.isAnonymous,
        donorMessage: data.donorMessage,
        receiptNumber: receiptNo,
      });

      const confirmedDonation: Donation = dbDonation || {
        id: crypto.randomUUID(),
        donorId: currentUser.id,
        donorName: data.isAnonymous ? 'Anonymous Philanthropist' : currentUser.profile.name,
        projectId: data.projectId,
        projectTitle: project.title,
        ngoId: project.ngoId,
        ngoName: project.ngoName,
        amount: data.amount,
        currency: 'INR',
        donatedAt: new Date().toISOString(),
        receiptNumber: receiptNo,
        paymentMethod: data.paymentMethod,
        status: 'SUCCESSFUL',
        isAnonymous: data.isAnonymous,
        donorMessage: data.donorMessage
      };

      setProjects(prev =>
        prev.map(p => {
          if (p.id !== data.projectId) return p;
          return {
            ...p,
            fundingRaised: p.fundingRaised + data.amount
          };
        })
      );

      setDonations(prev => [confirmedDonation, ...prev]);

      logAudit(
        'DONATION_RECEIVED',
        'PROJECT',
        data.projectId,
        `Received ₹${data.amount.toLocaleString('en-IN')} contribution. Receipt: ${receiptNo}`
      );

      pushNotification(
        currentUser.id,
        'Contribution Receipt Confirmed',
        `Thank you! ₹${data.amount.toLocaleString('en-IN')} donated to "${project.title}". 80G Receipt: ${receiptNo}.`,
        'SUCCESS'
      );

      pushNotification(
        project.ngoId,
        'Donation Received',
        `New contribution of ₹${data.amount.toLocaleString('en-IN')} received for "${project.title}".`,
        'SUCCESS'
      );

      return confirmedDonation;
    } finally {
      setIsSyncing(false);
    }
  };

  // 14. Log Fund Utilization
  const logFundUtilization = async (data: Omit<FundUtilization, 'id' | 'recordedBy'>): Promise<{ success: boolean; message: string }> => {
    const project = projects.find(p => p.id === data.projectId);
    if (!project) return { success: false, message: 'Project not found.' };

    const currentSpent = utilizations
      .filter(u => u.projectId === data.projectId)
      .reduce((sum, u) => sum + u.amount, 0);

    const availableBalance = project.fundingRaised - currentSpent;
    if (data.amount > availableBalance) {
      return {
        success: false,
        message: `Expense ₹${data.amount.toLocaleString('en-IN')} exceeds current available project balance ₹${availableBalance.toLocaleString('en-IN')}.`
      };
    }

    setIsSyncing(true);
    try {
      const res = await SupabaseService.logFundUtilization({
        ...data,
        recordedBy: currentUser.profile.name,
        actorId: currentUser.id,
      });

      if (res.success) {
        const newUtilization: FundUtilization = {
          ...data,
          id: crypto.randomUUID(),
          recordedBy: currentUser.profile.name
        };
        setUtilizations(prev => [newUtilization, ...prev]);
        logAudit(
          'FUND_UTILIZATION_RECORDED',
          'PROJECT',
          data.projectId,
          `Utilized ₹${data.amount.toLocaleString('en-IN')} for ${data.category} (Vendor: ${data.vendorName})`
        );
      }
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  // 15. NGO Verification Update
  const updateNgoVerification = (ngoUserId: string, status: NgoVerificationStatus) => {
    allUsers.forEach(u => {
      if (u.id === ngoUserId && u.profile.ngoDetails) {
        u.profile.ngoDetails.verificationStatus = status;
      }
    });

    logAudit('NGO_VERIFICATION_STATUS_CHANGED', 'NGO', ngoUserId, `Accreditation status changed to ${status}`);
    pushNotification(
      ngoUserId,
      `Accreditation Status: ${status}`,
      `Your NGO verification status has been updated to "${status}".`,
      status === 'VERIFIED' ? 'SUCCESS' : 'WARNING'
    );

    setIsSyncing(true);
    SupabaseService.updateNgoVerification(ngoUserId, status).finally(() => setIsSyncing(false));
  };

  // 16. Complaints
  const submitComplaint = (data: Omit<ComplaintReport, 'id' | 'reportedAt' | 'status' | 'reporterId' | 'reporterName'>) => {
    const newComplaint: ComplaintReport = {
      ...data,
      id: crypto.randomUUID(),
      reporterId: currentUser.id,
      reporterName: currentUser.profile.name,
      reportedAt: new Date().toISOString(),
      status: 'OPEN'
    };
    setComplaints(prev => [newComplaint, ...prev]);
    logAudit('COMPLAINT_FILED', 'USER', data.targetId, `Complaint filed: ${data.reason}`);

    setIsSyncing(true);
    SupabaseService.submitComplaint(newComplaint).finally(() => setIsSyncing(false));
  };

  const resolveComplaint = (complaintId: string, resolutionNote: string) => {
    setComplaints(prev =>
      prev.map(c => (c.id === complaintId ? { ...c, status: 'RESOLVED', resolutionNote } : c))
    );
    logAudit('COMPLAINT_RESOLVED', 'USER', complaintId, `Complaint resolved: ${resolutionNote}`);

    setIsSyncing(true);
    SupabaseService.resolveComplaint(complaintId, resolutionNote).finally(() => setIsSyncing(false));
  };

  // 17. Realtime Direct Messaging (Genuine database confirmation before state)
  const sendMessage = async (
    receiverId: string,
    receiverName: string,
    content: string,
    caseId?: string
  ): Promise<DirectMessage> => {
    setIsSyncing(true);
    try {
      const dbMsg = await SupabaseService.sendMessage({
        caseId,
        senderId: currentUser.id,
        senderName: currentUser.profile.name,
        senderRole: currentUser.role,
        receiverId,
        receiverName,
        content,
        timestamp: new Date().toISOString()
      });

      const confirmedMsg: DirectMessage = dbMsg || {
        id: crypto.randomUUID(),
        caseId,
        senderId: currentUser.id,
        senderName: currentUser.profile.name,
        senderRole: currentUser.role,
        receiverId,
        receiverName,
        content,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        if (prev.some(m => m.id === confirmedMsg.id)) return prev;
        return [...prev, confirmedMsg];
      });

      pushNotification(
        receiverId,
        `New Message from ${currentUser.profile.name}`,
        content.length > 60 ? `${content.slice(0, 60)}...` : content,
        'INFO'
      );

      return confirmedMsg;
    } catch (err: any) {
      console.error('[DataContext] sendMessage failed:', err);
      triggerToast('Message Error', err.message || 'Message could not be sent to recipient.', 'ALERT');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );

    setIsSyncing(true);
    SupabaseService.markNotificationRead(notificationId).finally(() => setIsSyncing(false));
  };

  const resetAllPlatformData = () => {
    StorageService.resetAllData();
    setCases(StorageService.getCases());
    setProjects(StorageService.getProjects());
    setOpportunities(StorageService.getOpportunities());
    setApplications(StorageService.getApplications());
    setDonations(StorageService.getDonations());
    setUtilizations(StorageService.getUtilizations());
    setAuditLogs(StorageService.getAuditLogs());
    setComplaints(StorageService.getComplaints());
    setNotifications(StorageService.getNotifications());
    setMessages([]);
  };

  // Global Impact Metrics computation
  const globalMetrics: GlobalImpactMetrics = useMemo(() => {
    const peopleFromProjects = projects.reduce((acc, p) => acc + p.reachedBeneficiaries, 0);
    const resolvedStandaloneCases = cases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const peopleHelped = peopleFromProjects + resolvedStandaloneCases;

    const casesResolved = cases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const projectsCompleted = projects.filter(p => p.status === 'COMPLETED').length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;

    const volunteerIds = new Set(
      applications.filter(a => a.status === 'ACCEPTED' || a.status === 'COMPLETED').map(a => a.volunteerId)
    );
    const volunteersEngaged = volunteerIds.size;

    const volunteerHoursLogged = applications.reduce((acc, a) => acc + (a.hoursLogged || 0), 0);
    const totalFundsRaised = donations.filter(d => d.status === 'SUCCESSFUL').reduce((acc, d) => acc + d.amount, 0);
    const totalFundsUtilized = utilizations.reduce((acc, u) => acc + u.amount, 0);

    const locations = new Set([
      ...projects.map(p => `${p.location.city}_${p.location.state}`),
      ...cases.map(c => `${c.location.city}_${c.location.state}`)
    ]);
    const communitiesReached = locations.size;

    const causes = new Set([
      ...projects.map(p => p.cause),
      ...cases.map(c => c.category)
    ]);
    const causesSupported = causes.size;

    return {
      peopleHelped,
      casesResolved,
      projectsCompleted,
      activeProjects,
      volunteersEngaged,
      volunteerHoursLogged,
      totalFundsUtilized,
      totalFundsRaised,
      communitiesReached,
      causesSupported
    };
  }, [cases, projects, applications, donations, utilizations]);

  return (
    <DataContext.Provider
      value={{
        isLoading,
        isSyncing,
        activeToast,
        dismissToast,
        cases,
        projects,
        opportunities,
        applications,
        donations,
        utilizations,
        auditLogs,
        complaints,
        notifications,
        messages,
        globalMetrics,
        allUsers,
        submitHelpRequest,
        updateCaseStatus,
        assignCaseNgo,
        linkCaseToProject,
        resolveCase,
        createProject,
        toggleMilestone,
        addProjectUpdate,
        createOpportunity,
        applyForOpportunity,
        updateApplicationStatus,
        logVolunteerHours,
        makeDonation,
        logFundUtilization,
        updateNgoVerification,
        submitComplaint,
        resolveComplaint,
        sendMessage,
        markNotificationRead,
        resetAllPlatformData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
