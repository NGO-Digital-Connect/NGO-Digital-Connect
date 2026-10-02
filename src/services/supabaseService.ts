/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

import type {
  UserAccount,
  UserProfile,
  HelpRequest,
  Project,
  ProjectMilestone,
  VolunteerOpportunity,
  VolunteerApplication,
  Donation,
  FundUtilization,
  AuditLog,
  ComplaintReport,
  NotificationItem,
  DirectMessage,
  CaseStatus,
  NgoVerificationStatus,
  UserRole,
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
  SEED_NOTIFICATIONS,
} from '../data/seedData';

// Helper to map Supabase profile row with joined role relations to UserAccount
export const mapDbProfileToUserAccount = (p: any): UserAccount => {
  const ngo = Array.isArray(p.ngo_details) ? p.ngo_details[0] : p.ngo_details;
  const vol = Array.isArray(p.volunteer_details) ? p.volunteer_details[0] : p.volunteer_details;
  const donor = Array.isArray(p.donor_details) ? p.donor_details[0] : p.donor_details;
  const csr = Array.isArray(p.csr_details) ? p.csr_details[0] : p.csr_details;
  const gov = Array.isArray(p.government_details) ? p.government_details[0] : p.government_details;

  const profile: UserProfile = {
    name: p.name || 'Anonymous User',
    phone: p.phone,
    city: p.city || 'Kolkata',
    state: p.state || 'West Bengal',
    country: p.country || 'India',
    bio: p.bio,
    organizationName: p.organization_name,
    designation: p.designation,
    ngoDetails: ngo
      ? {
          ngoId: ngo.ngo_id || ngo.id,
          registrationNumber: ngo.registration_number || '',
          foundedYear: ngo.founded_year || new Date().getFullYear(),
          mission: ngo.mission || '',
          causes: ngo.causes || [],
          serviceAreas: ngo.service_areas || [],
          taxExemption80G: Boolean(ngo.tax_exemption_80g),
          csr1Number: ngo.csr1_number,
          verificationStatus: ngo.verification_status || 'PENDING',
          totalBeneficiariesServed: Number(ngo.total_beneficiaries_served) || 0,
          activeProjectCount: Number(ngo.active_project_count) || 0,
        }
      : undefined,
    volunteerDetails: vol
      ? {
          skills: vol.skills || [],
          causes: vol.causes || [],
          availability: vol.availability || 'FLEXIBLE',
          hoursLogged: Number(vol.hours_logged) || 0,
          experienceYears: vol.experience_years,
        }
      : undefined,
    donorDetails: donor
      ? {
          preferredCauses: donor.preferred_causes || [],
          taxPan: donor.tax_pan,
          totalDonated: Number(donor.total_donated) || 0,
          isAnonymousPreferred: Boolean(donor.is_anonymous_preferred),
        }
      : undefined,
    csrDetails: csr
      ? {
          companyName: csr.company_name || p.organization_name || 'CSR Partner',
          cinNumber: csr.cin_number,
          annualBudget: Number(csr.annual_budget) || 0,
          focusStates: csr.focus_states || [],
          preferredCauses: csr.preferred_causes || [],
          grantsCommitted: Number(csr.grants_committed) || 0,
        }
      : undefined,
    governmentDetails: gov
      ? {
          department: gov.department || 'District Welfare Office',
          officialJurisdiction: gov.official_jurisdiction || 'Regional Unit',
          designation: gov.designation || 'Nodal Officer',
          authorizedIdNumber: gov.authorized_id_number || 'GOV-DEFAULT',
        }
      : undefined,
  };

  return {
    id: p.id,
    email: p.email,
    role: p.role,
    status: p.status || 'ACTIVE',
    createdAt: p.created_at || new Date().toISOString(),
    avatar: p.avatar,
    profile,
  };
};

export const SupabaseService = {
  isConfigured: () => isSupabaseConfigured,

  // ============================================================================
  // 1. PROFILES & AUTHENTICATED USERS
  // ============================================================================

  getUsers: async (): Promise<UserAccount[]> => {
    if (!isSupabaseConfigured) return SEED_USERS;
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id, email, role, status, name, phone, city, state, country, bio, avatar, organization_name, designation, created_at,
          ngo_details (*),
          volunteer_details (*),
          donor_details (*),
          csr_details (*),
          government_details (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseService] Error fetching profiles from database:', error.message);
        return SEED_USERS;
      }

      if (!profiles || profiles.length === 0) {
        return SEED_USERS;
      }

      return profiles.map(mapDbProfileToUserAccount);
    } catch (e) {
      console.error('[SupabaseService] Unexpected error loading users:', e);
      return SEED_USERS;
    }
  },

  getUserById: async (userId: string): Promise<UserAccount | null> => {
    if (!isSupabaseConfigured) {
      return SEED_USERS.find(u => u.id === userId) || null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, email, role, status, name, phone, city, state, country, bio, avatar, organization_name, designation, created_at,
          ngo_details (*),
          volunteer_details (*),
          donor_details (*),
          csr_details (*),
          government_details (*)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error(`[SupabaseService] Error loading user ${userId}:`, error.message);
        return null;
      }

      return data ? mapDbProfileToUserAccount(data) : null;
    } catch (e) {
      console.error(`[SupabaseService] Exception loading user ${userId}:`, e);
      return null;
    }
  },

  updateProfile: async (userId: string, partial: Partial<UserProfile>): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const updateData: any = {};
      if (partial.name !== undefined) updateData.name = partial.name;
      if (partial.phone !== undefined) updateData.phone = partial.phone;
      if (partial.city !== undefined) updateData.city = partial.city;
      if (partial.state !== undefined) updateData.state = partial.state;
      if (partial.country !== undefined) updateData.country = partial.country;
      if (partial.bio !== undefined) updateData.bio = partial.bio;
      if (partial.organizationName !== undefined) updateData.organization_name = partial.organizationName;
      if (partial.designation !== undefined) updateData.designation = partial.designation;

      const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
      if (error) {
        console.error('[SupabaseService] updateProfile failed:', error.message);
        throw error;
      }
    } catch (e) {
      console.error('[SupabaseService] updateProfile error:', e);
      throw e;
    }
  },

  saveRoleDetails: async (userId: string, role: UserRole, profile: UserProfile): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      if (role === 'NGO' && profile.ngoDetails) {
        const ngo = profile.ngoDetails;
        const { error } = await supabase.from('ngo_details').upsert({
          profile_id: userId,
          registration_number: ngo.registrationNumber,
          founded_year: ngo.foundedYear,
          mission: ngo.mission,
          causes: ngo.causes || [],
          service_areas: ngo.serviceAreas || [profile.city],
          tax_exemption_80g: ngo.taxExemption80G,
          csr1_number: ngo.csr1Number,
          verification_status: ngo.verificationStatus || 'PENDING',
        }, { onConflict: 'profile_id' });
        if (error) console.error('[SupabaseService] saveRoleDetails (NGO) error:', error.message);
      } else if (role === 'VOLUNTEER' && profile.volunteerDetails) {
        const vol = profile.volunteerDetails;
        const { error } = await supabase.from('volunteer_details').upsert({
          profile_id: userId,
          skills: vol.skills || [],
          causes: vol.causes || [],
          availability: vol.availability || 'FLEXIBLE',
          hours_logged: vol.hoursLogged || 0,
          experience_years: vol.experienceYears,
        }, { onConflict: 'profile_id' });
        if (error) console.error('[SupabaseService] saveRoleDetails (Volunteer) error:', error.message);
      } else if (role === 'DONOR' && profile.donorDetails) {
        const donor = profile.donorDetails;
        const { error } = await supabase.from('donor_details').upsert({
          profile_id: userId,
          preferred_causes: donor.preferredCauses || [],
          tax_pan: donor.taxPan,
          total_donated: donor.totalDonated || 0,
          is_anonymous_preferred: donor.isAnonymousPreferred || false,
        }, { onConflict: 'profile_id' });
        if (error) console.error('[SupabaseService] saveRoleDetails (Donor) error:', error.message);
      } else if (role === 'CSR' && profile.csrDetails) {
        const csr = profile.csrDetails;
        const { error } = await supabase.from('csr_details').upsert({
          profile_id: userId,
          company_name: csr.companyName || profile.organizationName,
          cin_number: csr.cinNumber,
          annual_budget: csr.annualBudget || 0,
          focus_states: csr.focusStates || [profile.state],
          preferred_causes: csr.preferredCauses || [],
          grants_committed: csr.grantsCommitted || 0,
        }, { onConflict: 'profile_id' });
        if (error) console.error('[SupabaseService] saveRoleDetails (CSR) error:', error.message);
      } else if (role === 'GOVERNMENT' && profile.governmentDetails) {
        const gov = profile.governmentDetails;
        const { error } = await supabase.from('government_details').upsert({
          profile_id: userId,
          department: gov.department,
          official_jurisdiction: gov.officialJurisdiction,
          designation: gov.designation,
          authorized_id_number: gov.authorizedIdNumber,
        }, { onConflict: 'profile_id' });
        if (error) console.error('[SupabaseService] saveRoleDetails (Government) error:', error.message);
      }
    } catch (e) {
      console.error('[SupabaseService] saveRoleDetails error:', e);
    }
  },

  updateNgoVerification: async (ngoUserId: string, status: NgoVerificationStatus): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('ngo_details')
        .update({ verification_status: status })
        .eq('profile_id', ngoUserId);
      if (error) console.error('[SupabaseService] updateNgoVerification error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] updateNgoVerification error:', e);
    }
  },

  // ============================================================================
  // 2. BENEFICIARY CASES (HELP REQUESTS)
  // ============================================================================

  getCases: async (): Promise<HelpRequest[]> => {
    if (!isSupabaseConfigured) return SEED_CASES;
    try {
      const { data, error } = await supabase
        .from('help_requests')
        .select(`
          *,
          beneficiary:profiles!beneficiary_id(name, phone),
          assigned_ngo:profiles!assigned_ngo_id(name, organization_name),
          case_documents(*),
          case_status_history(*)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('[SupabaseService] Could not fetch cases:', error.message);
        return SEED_CASES;
      }

      if (!data || data.length === 0) {
        return SEED_CASES;
      }

      return data.map((c: any): HelpRequest => {
        const history = (c.case_status_history || []).map((h: any) => ({
          status: h.status,
          updatedAt: h.updated_at,
          updatedBy: h.updated_by,
          note: h.note,
        })).sort((a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

        const documents = (c.case_documents || []).map((d: any) => ({
          name: d.name,
          url: d.url,
          type: d.type || 'application/pdf',
        }));

        return {
          id: c.id,
          beneficiaryId: c.beneficiary_id,
          beneficiaryName: c.beneficiary?.name || 'Beneficiary',
          contactPhone: c.contact_phone || c.beneficiary?.phone,
          title: c.title,
          category: c.category,
          urgency: c.urgency,
          description: c.description,
          location: {
            city: c.location_city,
            state: c.location_state,
            address: c.location_address,
            postalCode: c.location_postal_code,
          },
          requiredSupportType: c.required_support_type,
          estimatedCost: Number(c.estimated_cost) || 0,
          documents,
          status: c.status,
          assignedNgoId: c.assigned_ngo_id,
          assignedNgoName: c.assigned_ngo?.organization_name || c.assigned_ngo?.name,
          assignedStaffName: c.assigned_staff_name,
          linkedProjectId: c.linked_project_id,
          resolutionNotes: c.resolution_notes,
          resolutionEvidenceUrl: c.resolution_evidence_url,
          submittedAt: c.submitted_at,
          updatedAt: c.updated_at,
          statusHistory: history,
        };
      });
    } catch (e) {
      console.error('[SupabaseService] getCases failed:', e);
      return SEED_CASES;
    }
  },

  createCase: async (newCase: Omit<HelpRequest, 'id'> & { id?: string }): Promise<HelpRequest> => {
    if (!isSupabaseConfigured) {
      const generatedId = newCase.id || crypto.randomUUID();
      return { ...newCase, id: generatedId } as HelpRequest;
    }
    try {
      const casePayload: any = {
        beneficiary_id: newCase.beneficiaryId,
        title: newCase.title,
        category: newCase.category,
        urgency: newCase.urgency,
        description: newCase.description,
        location_city: newCase.location.city,
        location_state: newCase.location.state,
        location_address: newCase.location.address,
        location_postal_code: newCase.location.postalCode,
        required_support_type: newCase.requiredSupportType,
        estimated_cost: newCase.estimatedCost || 0,
        status: newCase.status || 'SUBMITTED',
        submitted_at: newCase.submittedAt || new Date().toISOString(),
        updated_at: newCase.updatedAt || new Date().toISOString(),
      };

      if (newCase.id) {
        casePayload.id = newCase.id;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('help_requests')
        .insert(casePayload)
        .select(`
          *,
          beneficiary:profiles!beneficiary_id(name, phone),
          assigned_ngo:profiles!assigned_ngo_id(name, organization_name)
        `)
        .single();

      if (insertError) {
        console.error('[SupabaseService] createCase insert error:', insertError.message);
        throw insertError;
      }

      const realCaseId = inserted.id;

      // Status history
      await supabase.from('case_status_history').insert({
        help_request_id: realCaseId,
        status: 'SUBMITTED',
        updated_at: newCase.submittedAt || new Date().toISOString(),
        updated_by: newCase.beneficiaryName,
        note: 'Need expressed and entered into platform intake queue.',
      });

      // Documents if any
      if (newCase.documents && newCase.documents.length > 0) {
        const docRows = newCase.documents.map(d => ({
          help_request_id: realCaseId,
          name: d.name,
          url: d.url,
          type: d.type,
        }));
        await supabase.from('case_documents').insert(docRows);
      }

      return {
        id: realCaseId,
        beneficiaryId: inserted.beneficiary_id,
        beneficiaryName: inserted.beneficiary?.name || newCase.beneficiaryName,
        contactPhone: inserted.contact_phone || inserted.beneficiary?.phone || newCase.contactPhone,
        title: inserted.title,
        category: inserted.category,
        urgency: inserted.urgency,
        description: inserted.description,
        location: {
          city: inserted.location_city,
          state: inserted.location_state,
          address: inserted.location_address,
          postalCode: inserted.location_postal_code,
        },
        requiredSupportType: inserted.required_support_type,
        estimatedCost: Number(inserted.estimated_cost) || 0,
        documents: newCase.documents || [],
        status: inserted.status,
        assignedNgoId: inserted.assigned_ngo_id,
        assignedNgoName: inserted.assigned_ngo?.organization_name || inserted.assigned_ngo?.name,
        assignedStaffName: inserted.assigned_staff_name,
        linkedProjectId: inserted.linked_project_id,
        resolutionNotes: inserted.resolution_notes,
        resolutionEvidenceUrl: inserted.resolution_evidence_url,
        submittedAt: inserted.submitted_at,
        updatedAt: inserted.updated_at,
        statusHistory: [
          {
            status: 'SUBMITTED',
            updatedAt: inserted.submitted_at,
            updatedBy: newCase.beneficiaryName,
            note: 'Need expressed and entered into platform intake queue.',
          },
        ],
      };
    } catch (e) {
      console.error('[SupabaseService] createCase error:', e);
      throw e;
    }
  },

  updateCaseStatus: async (caseId: string, status: CaseStatus, updatedBy: string, note?: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('help_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', caseId);
      if (error) console.error('[SupabaseService] updateCaseStatus error:', error.message);

      await supabase.from('case_status_history').insert({
        help_request_id: caseId,
        status,
        updated_by: updatedBy,
        note: note || `Status updated to ${status}`,
      });
    } catch (e) {
      console.error('[SupabaseService] updateCaseStatus error:', e);
    }
  },

  assignCaseNgo: async (caseId: string, ngoId: string, ngoName: string, updatedBy: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({
          assigned_ngo_id: ngoId,
          status: 'ACCEPTED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);
      if (error) console.error('[SupabaseService] assignCaseNgo error:', error.message);

      await supabase.from('case_status_history').insert({
        help_request_id: caseId,
        status: 'ACCEPTED',
        updated_by: updatedBy,
        note: `Assigned and accepted by ${ngoName}`,
      });
    } catch (e) {
      console.error('[SupabaseService] assignCaseNgo error:', e);
    }
  },

  linkCaseToProject: async (caseId: string, projectId: string, updatedBy: string, projectTitle?: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({
          linked_project_id: projectId,
          status: 'IN_PROGRESS',
          updated_at: new Date().toISOString(),
        })
        .eq('id', caseId);
      if (error) console.error('[SupabaseService] linkCaseToProject error:', error.message);

      await supabase.from('case_status_history').insert({
        help_request_id: caseId,
        status: 'IN_PROGRESS',
        updated_by: updatedBy,
        note: `Connected to project: "${projectTitle || projectId}"`,
      });
    } catch (e) {
      console.error('[SupabaseService] linkCaseToProject error:', e);
    }
  },

  resolveCase: async (caseId: string, notes: string, evidenceUrl?: string, actorName?: string, actorId?: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error: rpcError } = await supabase.rpc('rpc_resolve_case', {
        p_case_id: caseId,
        p_notes: notes,
        p_evidence_url: evidenceUrl || null,
        p_actor_name: actorName || 'NGO Caseworker',
        p_actor_id: actorId || null,
      });

      if (rpcError) {
        await supabase
          .from('help_requests')
          .update({
            status: 'RESOLVED',
            resolution_notes: notes,
            resolution_evidence_url: evidenceUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', caseId);

        await supabase.from('case_status_history').insert({
          help_request_id: caseId,
          status: 'RESOLVED',
          updated_by: actorName || 'NGO Caseworker',
          note: `Case resolved: ${notes}`,
        });
      }
    } catch (e) {
      console.error('[SupabaseService] resolveCase error:', e);
    }
  },

  // ============================================================================
  // 3. PROJECTS, MILESTONES & UPDATES
  // ============================================================================

  getProjects: async (): Promise<Project[]> => {
    if (!isSupabaseConfigured) return SEED_PROJECTS;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          ngo:profiles!ngo_id(name, organization_name),
          project_milestones(*),
          project_updates(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseService] Could not fetch projects:', error.message);
        return SEED_PROJECTS;
      }

      if (!data || data.length === 0) return SEED_PROJECTS;

      return data.map((p: any): Project => {
        const milestones: ProjectMilestone[] = (p.project_milestones || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          targetDate: m.target_date,
          isCompleted: m.is_completed,
          completedDate: m.completed_date,
          evidenceUrl: m.evidence_url,
          notes: m.notes,
        }));

        const updates = (p.project_updates || []).map((u: any) => ({
          id: u.id,
          date: u.date,
          title: u.title,
          content: u.content,
          imageUrl: u.image_url,
        })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          id: p.id,
          ngoId: p.ngo_id,
          ngoName: p.ngo?.organization_name || p.ngo?.name || 'NGO Partner',
          title: p.title,
          description: p.description,
          cause: p.cause,
          location: {
            city: p.location_city,
            state: p.location_state,
          },
          targetBeneficiaries: p.target_beneficiaries,
          reachedBeneficiaries: p.reached_beneficiaries,
          startDate: p.start_date,
          endDate: p.end_date,
          fundingTarget: Number(p.funding_target),
          fundingRaised: Number(p.funding_raised),
          volunteersNeeded: p.volunteers_needed,
          volunteersEnrolled: p.volunteers_enrolled,
          status: p.status,
          milestones,
          imageUrl: p.image_url || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
          updates,
          allowOverfunding: p.allow_overfunding,
        };
      });
    } catch (e) {
      console.error('[SupabaseService] getProjects error:', e);
      return SEED_PROJECTS;
    }
  },

  createProject: async (project: Omit<Project, 'id'> & { id?: string }): Promise<Project> => {
    if (!isSupabaseConfigured) {
      const generatedId = project.id || crypto.randomUUID();
      return { ...project, id: generatedId } as Project;
    }
    try {
      const payload: any = {
        ngo_id: project.ngoId,
        title: project.title,
        description: project.description,
        cause: project.cause,
        location_city: project.location.city,
        location_state: project.location.state,
        target_beneficiaries: project.targetBeneficiaries,
        reached_beneficiaries: project.reachedBeneficiaries || 0,
        start_date: project.startDate,
        end_date: project.endDate,
        funding_target: project.fundingTarget,
        funding_raised: project.fundingRaised || 0,
        volunteers_needed: project.volunteersNeeded,
        volunteers_enrolled: project.volunteersEnrolled || 0,
        status: project.status || 'ACTIVE',
        image_url: project.imageUrl,
        allow_overfunding: project.allowOverfunding || false,
      };

      if (project.id) payload.id = project.id;

      const { data: inserted, error } = await supabase
        .from('projects')
        .insert(payload)
        .select(`*, ngo:profiles!ngo_id(name, organization_name)`)
        .single();

      if (error) {
        console.error('[SupabaseService] createProject error:', error.message);
        throw error;
      }

      const realProjectId = inserted.id;

      if (project.milestones && project.milestones.length > 0) {
        const msRows = project.milestones.map(m => ({
          project_id: realProjectId,
          title: m.title,
          target_date: m.targetDate,
          is_completed: m.isCompleted,
        }));
        await supabase.from('project_milestones').insert(msRows);
      }

      if (project.updates && project.updates.length > 0) {
        const upRows = project.updates.map(u => ({
          project_id: realProjectId,
          date: u.date,
          title: u.title,
          content: u.content,
          image_url: u.imageUrl,
        }));
        await supabase.from('project_updates').insert(upRows);
      }

      return {
        ...project,
        id: realProjectId,
        ngoName: inserted.ngo?.organization_name || inserted.ngo?.name || project.ngoName,
      };
    } catch (e) {
      console.error('[SupabaseService] createProject error:', e);
      throw e;
    }
  },

  toggleMilestone: async (milestoneId: string, isCompleted: boolean, completedDate?: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({
          is_completed: isCompleted,
          completed_date: isCompleted ? (completedDate || new Date().toISOString().split('T')[0]) : null,
        })
        .eq('id', milestoneId);
      if (error) console.error('[SupabaseService] toggleMilestone error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] toggleMilestone error:', e);
    }
  },

  addProjectUpdate: async (projectId: string, title: string, content: string, imageUrl?: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('project_updates').insert({
        project_id: projectId,
        date: new Date().toISOString().split('T')[0],
        title,
        content,
        image_url: imageUrl,
      });
      if (error) console.error('[SupabaseService] addProjectUpdate error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] addProjectUpdate error:', e);
    }
  },

  // ============================================================================
  // 4. VOLUNTEER OPPORTUNITIES & APPLICATIONS
  // ============================================================================

  getOpportunities: async (): Promise<VolunteerOpportunity[]> => {
    if (!isSupabaseConfigured) return SEED_OPPORTUNITIES;
    try {
      const { data, error } = await supabase
        .from('volunteer_opportunities')
        .select(`
          *,
          ngo:profiles!ngo_id(name, organization_name),
          project:projects!project_id(title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SupabaseService] Could not fetch opportunities:', error.message);
        return SEED_OPPORTUNITIES;
      }

      if (!data || data.length === 0) return SEED_OPPORTUNITIES;

      return data.map((o: any): VolunteerOpportunity => ({
        id: o.id,
        projectId: o.project_id,
        projectTitle: o.project?.title || o.title,
        ngoId: o.ngo_id,
        ngoName: o.ngo?.organization_name || o.ngo?.name || 'Partner NGO',
        title: o.title,
        cause: o.cause,
        description: o.description,
        location: {
          city: o.location_city,
          state: o.location_state,
          mode: o.location_mode,
        },
        date: o.date,
        duration: o.duration,
        skillsRequired: o.skills_required || [],
        slotsTotal: o.slots_total,
        slotsFilled: o.slots_filled,
        status: o.status,
        requirements: o.requirements || [],
      }));
    } catch (e) {
      console.error('[SupabaseService] getOpportunities error:', e);
      return SEED_OPPORTUNITIES;
    }
  },

  createOpportunity: async (opp: Omit<VolunteerOpportunity, 'id'> & { id?: string }): Promise<VolunteerOpportunity> => {
    if (!isSupabaseConfigured) {
      const generatedId = opp.id || crypto.randomUUID();
      return { ...opp, id: generatedId } as VolunteerOpportunity;
    }
    try {
      const payload: any = {
        project_id: opp.projectId || null,
        ngo_id: opp.ngoId,
        title: opp.title,
        cause: opp.cause,
        description: opp.description,
        location_city: opp.location.city,
        location_state: opp.location.state,
        location_mode: opp.location.mode,
        date: opp.date,
        duration: opp.duration,
        skills_required: opp.skillsRequired,
        slots_total: opp.slotsTotal,
        slots_filled: opp.slotsFilled || 0,
        status: opp.status || 'OPEN',
        requirements: opp.requirements,
      };

      if (opp.id) payload.id = opp.id;

      const { data: inserted, error } = await supabase
        .from('volunteer_opportunities')
        .insert(payload)
        .select(`*, ngo:profiles!ngo_id(name, organization_name), project:projects!project_id(title)`)
        .single();

      if (error) {
        console.error('[SupabaseService] createOpportunity error:', error.message);
        throw error;
      }

      return {
        id: inserted.id,
        projectId: inserted.project_id,
        projectTitle: inserted.project?.title || opp.projectTitle,
        ngoId: inserted.ngo_id,
        ngoName: inserted.ngo?.organization_name || inserted.ngo?.name || opp.ngoName,
        title: inserted.title,
        cause: inserted.cause,
        description: inserted.description,
        location: {
          city: inserted.location_city,
          state: inserted.location_state,
          mode: inserted.location_mode,
        },
        date: inserted.date,
        duration: inserted.duration,
        skillsRequired: inserted.skills_required || [],
        slotsTotal: inserted.slots_total,
        slotsFilled: inserted.slots_filled,
        status: inserted.status,
        requirements: inserted.requirements || [],
      };
    } catch (e) {
      console.error('[SupabaseService] createOpportunity error:', e);
      throw e;
    }
  },

  getApplications: async (): Promise<VolunteerApplication[]> => {
    if (!isSupabaseConfigured) return SEED_APPLICATIONS;
    try {
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select(`
          *,
          opportunity:volunteer_opportunities!opportunity_id(title, ngo_id),
          volunteer:profiles!volunteer_id(name)
        `)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('[SupabaseService] Could not fetch applications:', error.message);
        return SEED_APPLICATIONS;
      }

      if (!data || data.length === 0) return SEED_APPLICATIONS;

      return data.map((a: any): VolunteerApplication => ({
        id: a.id,
        opportunityId: a.opportunity_id,
        opportunityTitle: a.opportunity?.title || 'Volunteer Drive',
        volunteerId: a.volunteer_id,
        volunteerName: a.volunteer?.name || 'Volunteer',
        ngoId: a.opportunity?.ngo_id || '',
        appliedAt: a.applied_at,
        status: a.status,
        hoursLogged: a.hours_logged ? Number(a.hours_logged) : undefined,
        feedback: a.feedback,
      }));
    } catch (e) {
      console.error('[SupabaseService] getApplications error:', e);
      return SEED_APPLICATIONS;
    }
  },

  applyForOpportunity: async (opportunityId: string, volunteerId: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured) return { success: true, message: 'Application submitted.' };
    try {
      const { data, error } = await supabase.rpc('rpc_apply_for_opportunity', {
        p_opportunity_id: opportunityId,
        p_volunteer_id: volunteerId,
      });

      if (error) {
        const { error: insErr } = await supabase.from('volunteer_applications').insert({
          opportunity_id: opportunityId,
          volunteer_id: volunteerId,
          status: 'PENDING',
        });
        if (insErr) {
          return { success: false, message: insErr.message || 'Application failed.' };
        }
        return { success: true, message: 'Application submitted successfully to the NGO for review.' };
      }

      return data;
    } catch (e: any) {
      console.error('[SupabaseService] applyForOpportunity error:', e);
      return { success: false, message: e.message || 'Application could not be processed.' };
    }
  },

  updateApplicationStatus: async (applicationId: string, status: VolunteerApplication['status'], actorId: string, actorName: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error: rpcErr } = await supabase.rpc('rpc_update_application_status', {
        p_application_id: applicationId,
        p_status: status,
        p_actor_id: actorId,
        p_actor_name: actorName,
      });

      if (rpcErr) {
        await supabase
          .from('volunteer_applications')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', applicationId);
      }
    } catch (e) {
      console.error('[SupabaseService] updateApplicationStatus error:', e);
    }
  },

  logVolunteerHours: async (applicationId: string, hours: number): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .update({
          hours_logged: hours,
          status: 'COMPLETED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
      if (error) console.error('[SupabaseService] logVolunteerHours error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] logVolunteerHours error:', e);
    }
  },

  // ============================================================================
  // 5. DONATIONS & FUND UTILIZATION
  // ============================================================================

  getDonations: async (): Promise<Donation[]> => {
    if (!isSupabaseConfigured) return SEED_DONATIONS;
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:profiles!donor_id(name),
          project:projects!project_id(title, ngo:profiles!ngo_id(name, organization_name))
        `)
        .order('donated_at', { ascending: false });

      if (error) {
        console.error('[SupabaseService] Could not fetch donations:', error.message);
        return SEED_DONATIONS;
      }

      if (!data || data.length === 0) return SEED_DONATIONS;

      return data.map((d: any): Donation => ({
        id: d.id,
        donorId: d.donor_id,
        donorName: d.is_anonymous ? 'Anonymous Philanthropist' : (d.donor?.name || 'Donor'),
        projectId: d.project_id,
        projectTitle: d.project?.title || 'Relief Initiative',
        ngoId: d.project?.ngo_id || '',
        ngoName: d.project?.ngo?.organization_name || d.project?.ngo?.name || 'Partner NGO',
        amount: Number(d.amount),
        currency: d.currency || 'INR',
        donatedAt: d.donated_at,
        receiptNumber: d.receipt_number,
        paymentMethod: d.payment_method,
        status: d.status,
        isAnonymous: d.is_anonymous,
        donorMessage: d.donor_message,
      }));
    } catch (e) {
      console.error('[SupabaseService] getDonations error:', e);
      return SEED_DONATIONS;
    }
  },

  makeDonation: async (data: {
    donorId: string;
    projectId: string;
    amount: number;
    paymentMethod: string;
    isAnonymous: boolean;
    donorMessage?: string;
    receiptNumber?: string;
  }): Promise<Donation | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: rpcRes, error } = await supabase.rpc('rpc_make_donation', {
        p_donor_id: data.donorId,
        p_project_id: data.projectId,
        p_amount: data.amount,
        p_payment_method: data.paymentMethod,
        p_is_anonymous: data.isAnonymous,
        p_donor_message: data.donorMessage || null,
        p_receipt_number: data.receiptNumber || null,
      });

      if (error) {
        const receiptNo = data.receiptNumber || `80G-NGO-${Date.now().toString().slice(-6)}`;
        const { data: insData, error: insErr } = await supabase.from('donations').insert({
          donor_id: data.donorId,
          project_id: data.projectId,
          amount: data.amount,
          currency: 'INR',
          receipt_number: receiptNo,
          payment_method: data.paymentMethod,
          status: 'SUCCESSFUL',
          is_anonymous: data.isAnonymous,
          donor_message: data.donorMessage,
        }).select().single();

        if (insErr) {
          console.error('[SupabaseService] makeDonation insert fallback error:', insErr.message);
          throw insErr;
        }

        return insData;
      }

      return rpcRes;
    } catch (e) {
      console.error('[SupabaseService] makeDonation error:', e);
      throw e;
    }
  },

  getUtilizations: async (): Promise<FundUtilization[]> => {
    if (!isSupabaseConfigured) return SEED_UTILIZATIONS;
    try {
      const { data, error } = await supabase
        .from('fund_utilizations')
        .select('*')
        .order('spent_date', { ascending: false });

      if (error) {
        console.error('[SupabaseService] Could not fetch utilizations:', error.message);
        return SEED_UTILIZATIONS;
      }

      if (!data || data.length === 0) return SEED_UTILIZATIONS;

      return data.map((u: any): FundUtilization => ({
        id: u.id,
        projectId: u.project_id,
        ngoId: u.ngo_id,
        category: u.category,
        amount: Number(u.amount),
        description: u.description,
        spentDate: u.spent_date,
        vendorName: u.vendor_name,
        invoiceProofUrl: u.invoice_proof_url,
        recordedBy: u.recorded_by,
      }));
    } catch (e) {
      console.error('[SupabaseService] getUtilizations error:', e);
      return SEED_UTILIZATIONS;
    }
  },

  logFundUtilization: async (data: Omit<FundUtilization, 'id' | 'recordedBy'> & { recordedBy: string; actorId?: string }): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured) return { success: true, message: 'Expense logged.' };
    try {
      const { data: rpcRes, error } = await supabase.rpc('rpc_log_fund_utilization', {
        p_project_id: data.projectId,
        p_ngo_id: data.ngoId,
        p_category: data.category,
        p_amount: data.amount,
        p_description: data.description,
        p_spent_date: data.spentDate,
        p_vendor_name: data.vendorName,
        p_invoice_proof_url: data.invoiceProofUrl || null,
        p_recorded_by: data.recordedBy,
        p_actor_id: data.actorId || data.ngoId,
      });

      if (error) {
        const { error: insErr } = await supabase.from('fund_utilizations').insert({
          project_id: data.projectId,
          ngo_id: data.ngoId,
          category: data.category,
          amount: data.amount,
          description: data.description,
          spent_date: data.spentDate,
          vendor_name: data.vendorName,
          invoice_proof_url: data.invoiceProofUrl,
          recorded_by: data.recordedBy,
        });
        if (insErr) {
          return { success: false, message: insErr.message || 'Could not log expense.' };
        }
        return { success: true, message: 'Expense utilization record logged with invoice reference.' };
      }

      return rpcRes;
    } catch (e: any) {
      console.error('[SupabaseService] logFundUtilization error:', e);
      return { success: false, message: e.message || 'Expense could not be processed.' };
    }
  },

  // ============================================================================
  // 6. AUDIT LOGS, COMPLAINTS, NOTIFICATIONS & MESSAGES
  // ============================================================================

  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (!isSupabaseConfigured) return SEED_AUDIT_LOGS;
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error || !data || data.length === 0) {
        return SEED_AUDIT_LOGS;
      }

      return data.map((l: any): AuditLog => ({
        id: l.id,
        timestamp: l.timestamp,
        actorId: l.actor_id,
        actorName: l.actor_name,
        actorRole: l.actor_role,
        action: l.action,
        targetEntity: l.target_entity,
        targetId: l.target_id,
        details: l.details,
      }));
    } catch (e) {
      console.error('[SupabaseService] getAuditLogs error:', e);
      return SEED_AUDIT_LOGS;
    }
  },

  insertAuditLog: async (log: Omit<AuditLog, 'id'>): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('audit_logs').insert({
        timestamp: log.timestamp || new Date().toISOString(),
        actor_id: log.actorId || null,
        actor_name: log.actorName,
        actor_role: log.actorRole,
        action: log.action,
        target_entity: log.targetEntity,
        target_id: log.targetId,
        details: log.details,
      });
      if (error) console.error('[SupabaseService] insertAuditLog error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] insertAuditLog error:', e);
    }
  },

  getComplaints: async (): Promise<ComplaintReport[]> => {
    if (!isSupabaseConfigured) return SEED_COMPLAINTS;
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`*, reporter:profiles!reporter_id(name)`)
        .order('reported_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return SEED_COMPLAINTS;
      }

      return data.map((c: any): ComplaintReport => ({
        id: c.id,
        reporterId: c.reporter_id,
        reporterName: c.reporter?.name || 'Reporter',
        targetType: c.target_type,
        targetId: c.target_id,
        targetTitle: c.target_title,
        reason: c.reason,
        description: c.description,
        reportedAt: c.reported_at,
        status: c.status,
        resolutionNote: c.resolution_note,
      }));
    } catch (e) {
      console.error('[SupabaseService] getComplaints error:', e);
      return SEED_COMPLAINTS;
    }
  },

  submitComplaint: async (complaint: Omit<ComplaintReport, 'id'> & { id?: string }): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('complaints').insert({
        reporter_id: complaint.reporterId,
        target_type: complaint.targetType,
        target_id: complaint.targetId,
        target_title: complaint.targetTitle,
        reason: complaint.reason,
        description: complaint.description,
        status: 'OPEN',
      });
      if (error) console.error('[SupabaseService] submitComplaint error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] submitComplaint error:', e);
    }
  },

  resolveComplaint: async (complaintId: string, resolutionNote: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status: 'RESOLVED',
          resolution_note: resolutionNote,
        })
        .eq('id', complaintId);
      if (error) console.error('[SupabaseService] resolveComplaint error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] resolveComplaint error:', e);
    }
  },

  getNotifications: async (userId?: string): Promise<NotificationItem[]> => {
    if (!isSupabaseConfigured) return SEED_NOTIFICATIONS;
    try {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return SEED_NOTIFICATIONS;
      }
      return data.map((n: any): NotificationItem => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        createdAt: n.created_at,
        isRead: n.is_read,
        actionUrl: n.action_url,
      }));
    } catch (e) {
      console.error('[SupabaseService] getNotifications error:', e);
      return SEED_NOTIFICATIONS;
    }
  },

  insertNotification: async (notif: Omit<NotificationItem, 'id'>): Promise<NotificationItem | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('notifications').insert({
        user_id: notif.userId,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        is_read: false,
        action_url: notif.actionUrl,
      }).select().single();

      if (error) {
        console.error('[SupabaseService] insertNotification error:', error.message);
        return null;
      }
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type,
        createdAt: data.created_at,
        isRead: data.is_read,
        actionUrl: data.action_url,
      };
    } catch (e) {
      console.error('[SupabaseService] insertNotification error:', e);
      return null;
    }
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) console.error('[SupabaseService] markNotificationRead error:', error.message);
    } catch (e) {
      console.error('[SupabaseService] markNotificationRead error:', e);
    }
  },

  getMessages: async (userId?: string): Promise<DirectMessage[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase
        .from('direct_messages')
        .select(`
          *,
          sender:profiles!sender_id(name, role),
          receiver:profiles!receiver_id(name)
        `)
        .order('timestamp', { ascending: true });

      if (userId) {
        query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[SupabaseService] getMessages error:', error.message);
        return [];
      }
      if (!data) return [];

      return data.map((m: any): DirectMessage => ({
        id: m.id,
        caseId: m.case_id,
        senderId: m.sender_id,
        senderName: m.sender?.name || 'Sender',
        senderRole: m.sender?.role || 'BENEFICIARY',
        receiverId: m.receiver_id,
        receiverName: m.receiver?.name || 'Receiver',
        content: m.content,
        timestamp: m.timestamp,
      }));
    } catch (e) {
      console.error('[SupabaseService] getMessages error:', e);
      return [];
    }
  },

  sendMessage: async (msg: Omit<DirectMessage, 'id'>): Promise<DirectMessage | null> => {
    if (!isSupabaseConfigured) {
      return {
        ...msg,
        id: crypto.randomUUID(),
      };
    }
    try {
      const { data, error } = await supabase.from('direct_messages').insert({
        case_id: msg.caseId || null,
        sender_id: msg.senderId,
        receiver_id: msg.receiverId,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      }).select(`
        *,
        sender:profiles!sender_id(name, role),
        receiver:profiles!receiver_id(name)
      `).single();

      if (error) {
        console.error('[SupabaseService] sendMessage error:', error.message);
        throw error;
      }

      return {
        id: data.id,
        caseId: data.case_id,
        senderId: data.sender_id,
        senderName: data.sender?.name || msg.senderName,
        senderRole: data.sender?.role || msg.senderRole,
        receiverId: data.receiver_id,
        receiverName: data.receiver?.name || msg.receiverName,
        content: data.content,
        timestamp: data.timestamp,
      };
    } catch (e) {
      console.error('[SupabaseService] sendMessage error:', e);
      throw e;
    }
  },
};
