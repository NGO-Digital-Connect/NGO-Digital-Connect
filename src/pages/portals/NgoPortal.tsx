import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge, UrgencyBadge } from '../../components/common/Badge';
import { NgoAssistantModal } from '../../components/ai/NgoAssistantModal';
import { CAUSES_LIST } from '../../data/causes';
import type { HelpRequest, ExpenseCategory } from '../../types/models';

export const NgoPortal: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const {
    cases,
    projects,
    applications,
    updateCaseStatus,
    assignCaseNgo,
    linkCaseToProject,
    resolveCase,
    createProject,
    toggleMilestone,
    logFundUtilization,
    createOpportunity,
    updateApplicationStatus,
    logVolunteerHours
  } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'cases' | 'projects' | 'volunteers' | 'reports'>('cases');
  const [showAiModal, setShowAiModal] = useState(false);

  // Selected Case for Review/Triage
  const [selectedCase, setSelectedCase] = useState<HelpRequest | null>(null);
  const [linkProjectId, setLinkProjectId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionEvidenceUrl, setResolutionEvidenceUrl] = useState('');

  // Project Builder State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCause, setPCause] = useState('healthcare');
  const [pBudget, setPBudget] = useState(500000);
  const [pVols, setPVols] = useState(15);
  const [pBeneficiaries, setPBeneficiaries] = useState(250);
  const [pCity] = useState(currentUser.profile.city || 'Kolkata');
  const [pState] = useState(currentUser.profile.state || 'West Bengal');

  // Expense Logger State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseProjectId, setExpenseProjectId] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('DIRECT_RELIEF');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseFeedback, setExpenseFeedback] = useState<string | null>(null);

  // Opportunity Builder State
  const [showOppModal, setShowOppModal] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppDesc, setOppDesc] = useState('');
  const [oppCause] = useState('healthcare');
  const [oppProjectId, setOppProjectId] = useState('');
  const [oppCapacity, setOppCapacity] = useState(10);
  const [oppSkills] = useState<string[]>(['First Aid & Triage']);
  const [oppMode, setOppMode] = useState<'ON_FIELD' | 'REMOTE' | 'HYBRID'>('ON_FIELD');

  // Filter Cases
  const [caseFilter, setCaseFilter] = useState<'ALL' | 'UNASSIGNED' | 'ASSIGNED_TO_ME' | 'CRITICAL'>('ALL');

  const myProjects = projects.filter(p => p.ngoId === currentUser.id);
  const myApplications = applications.filter(a => a.ngoId === currentUser.id);


  const displayedCases = cases.filter(c => {
    if (caseFilter === 'CRITICAL') return c.urgency === 'CRITICAL' && c.status !== 'RESOLVED' && c.status !== 'CLOSED';
    if (caseFilter === 'UNASSIGNED') return !c.assignedNgoId && c.status !== 'REJECTED';
    if (caseFilter === 'ASSIGNED_TO_ME') return c.assignedNgoId === currentUser.id;
    return true;
  });

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pDesc) return;

    createProject({
      ngoId: currentUser.id,
      ngoName: currentUser.profile.organizationName || currentUser.profile.name,
      title: pTitle,
      description: pDesc,
      cause: pCause,
      location: { city: pCity, state: pState },
      fundingTarget: pBudget,
      volunteersNeeded: pVols,
      targetBeneficiaries: pBeneficiaries,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80'
    });

    setShowProjectModal(false);
    setPTitle('');
    setPDesc('');
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseProjectId || !expenseAmount || !expenseVendor) return;

    const res = await logFundUtilization({
      projectId: expenseProjectId,
      ngoId: currentUser.id,
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      description: expenseDesc || `${expenseCategory.replace('_', ' ')} procurement`,
      spentDate: new Date().toISOString().split('T')[0],
      vendorName: expenseVendor,
      invoiceProofUrl: '#'
    });

    if (res.success) {
      setExpenseFeedback('✓ Utilization logged successfully into transparent ledger.');
      setTimeout(() => {
        setShowExpenseModal(false);
        setExpenseFeedback(null);
        setExpenseAmount('');
        setExpenseVendor('');
        setExpenseDesc('');
      }, 1200);
    } else {
      setExpenseFeedback(`Error: ${res.message}`);
    }
  };

  const handleCreateOppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle || !oppDesc) return;

    const selectedProj = projects.find(p => p.id === oppProjectId);

    createOpportunity({
      projectId: oppProjectId || myProjects[0]?.id || 'proj_gen',
      projectTitle: selectedProj?.title || 'General Community Initiative',
      ngoId: currentUser.id,
      ngoName: currentUser.profile.organizationName || currentUser.profile.name,
      title: oppTitle,
      cause: oppCause,
      description: oppDesc,
      location: { city: currentUser.profile.city, state: currentUser.profile.state, mode: oppMode },
      date: 'Flexible Weekend Drive',
      duration: '4 Hours / Week',
      skillsRequired: oppSkills,
      slotsTotal: oppCapacity,
      requirements: ['Age 18+', 'Basic community orientation']
    });

    setShowOppModal(false);
    setOppTitle('');
    setOppDesc('');
  };

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Top Banner & Quick Copilot Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-verified">Accredited NGO Hub</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              12A/80G Certified • MCA CSR-1 Reg
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            {currentUser.profile.organizationName || currentUser.profile.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Coordinate incoming help requests, maintain multi-metric project ledgers, and mobilize community volunteers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAiModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#38bdf8', color: '#0369a1' }}
          >
            <Icons.Sparkles size={18} color="#0284c7" />
            <span>AI Operations Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('cases')}
          className={`btn ${activeTab === 'cases' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.AlertCircle size={16} />
          <span>Case Triage & Intake ({cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.Target size={16} />
          <span>Projects & Milestones ({myProjects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`btn ${activeTab === 'volunteers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.Users size={16} />
          <span>Volunteer Roster ({myApplications.length} Apps)</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.FileText size={16} />
          <span>Statutory Impact Dossiers</span>
        </button>
      </div>

      {/* TAB 1: CASE TRIAGE & MANAGEMENT */}
      {activeTab === 'cases' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedCase ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Inbound Help Requests</h2>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => setCaseFilter('ALL')}
                  className={`btn btn-sm ${caseFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  All ({cases.length})
                </button>
                <button
                  onClick={() => setCaseFilter('CRITICAL')}
                  className={`btn btn-sm ${caseFilter === 'CRITICAL' ? 'btn-danger' : 'btn-secondary'}`}
                >
                  🚨 Critical Only
                </button>
                <button
                  onClick={() => setCaseFilter('ASSIGNED_TO_ME')}
                  className={`btn btn-sm ${caseFilter === 'ASSIGNED_TO_ME' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Assigned to Me
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {displayedCases.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className="card card-hover"
                  style={{
                    cursor: 'pointer',
                    borderLeft: `4px solid ${c.urgency === 'CRITICAL' ? 'var(--danger)' : selectedCase?.id === c.id ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectedCase?.id === c.id ? 'var(--primary-light)' : '#ffffff',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      #{c.id} • {c.category} • {c.location.city}
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <UrgencyBadge urgency={c.urgency} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.35rem' }}>{c.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    <span>Estimated Need: <strong>₹{c.estimatedCost?.toLocaleString('en-IN') || 'TBD'}</strong></span>
                    <span>Assigned: <strong>{c.assignedNgoName || 'Unassigned'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Review & Action Inspector */}
          {selectedCase && (
            <div className="card" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Triage Inspection Dossier</span>
                  <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{selectedCase.title}</h2>
                </div>
                <button onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Icons.X size={18} />
                </button>
              </div>

              {/* Private Beneficiary Dossier Details */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Icons.Lock size={14} color="#059669" />
                  <span>Authorized Beneficiary Contact (Decrypted)</span>
                </div>
                <div><strong>Beneficiary:</strong> {selectedCase.beneficiaryName}</div>
                <div><strong>Contact Phone:</strong> {selectedCase.contactPhone || '+91 98301 23456'}</div>
                <div><strong>Address:</strong> {selectedCase.location.address || selectedCase.location.city}</div>
                <div><strong>Urgency Level:</strong> <UrgencyBadge urgency={selectedCase.urgency} /></div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {selectedCase.description}
              </p>

              {/* Document attachments */}
              {selectedCase.documents && selectedCase.documents.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Attached Verification Files</label>
                  {selectedCase.documents.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary)', background: '#eff6ff', padding: '0.5rem', borderRadius: '4px' }}>
                      <Icons.FileText size={16} />
                      <span>{d.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Triage Actions */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1. Accept Case */}
                {selectedCase.status === 'SUBMITTED' || selectedCase.status === 'UNDER_REVIEW' || selectedCase.status === 'VERIFIED' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        assignCaseNgo(
                          selectedCase.id,
                          currentUser.id,
                          currentUser.profile.organizationName || currentUser.profile.name
                        );
                        setSelectedCase({ ...selectedCase, status: 'ACCEPTED', assignedNgoId: currentUser.id });
                      }}
                      className="btn btn-success"
                      style={{ flex: 1 }}
                    >
                      ✓ Accept Case into Care
                    </button>
                    <button
                      onClick={() => updateCaseStatus(selectedCase.id, 'UNDER_REVIEW', 'Reviewing medical estimates')}
                      className="btn btn-secondary"
                    >
                      Mark Under Review
                    </button>
                  </div>
                ) : null}

                {/* 2. Link to Project */}
                {selectedCase.status === 'ACCEPTED' && !selectedCase.linkedProjectId && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <label className="form-label">Attach Case to an Active Project</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        className="form-select"
                        value={linkProjectId}
                        onChange={e => setLinkProjectId(e.target.value)}
                        style={{ margin: 0 }}
                      >
                        <option value="">Select Project...</option>
                        {myProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (linkProjectId) {
                            linkCaseToProject(selectedCase.id, linkProjectId);
                            setSelectedCase({ ...selectedCase, linkedProjectId: linkProjectId, status: 'IN_PROGRESS' });
                          }
                        }}
                        className="btn btn-primary"
                        disabled={!linkProjectId}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Mark Resolved */}
                {selectedCase.status === 'IN_PROGRESS' && (
                  <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                    <h4 style={{ fontSize: '0.9375rem', color: '#065f46', marginBottom: '0.5rem' }}>
                      Close & Record Resolution Outcome
                    </h4>
                    <textarea
                      className="form-textarea"
                      placeholder="Detail surgical outcome, ration kits distributed, or school fees disbursed..."
                      value={resolutionNotes}
                      onChange={e => setResolutionNotes(e.target.value)}
                      style={{ marginBottom: '0.5rem', background: '#fff' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Photographic / Medical Evidence URL"
                      value={resolutionEvidenceUrl}
                      onChange={e => setResolutionEvidenceUrl(e.target.value)}
                      style={{ marginBottom: '0.75rem', background: '#fff' }}
                    />
                    <button
                      onClick={() => {
                        if (resolutionNotes.trim()) {
                          resolveCase(selectedCase.id, resolutionNotes, resolutionEvidenceUrl);
                          setSelectedCase({ ...selectedCase, status: 'RESOLVED', resolutionNotes });
                        }
                      }}
                      className="btn btn-success"
                      style={{ width: '100%' }}
                    >
                      ✓ Confirm Resolution & Update Public Impact
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECTS & EXPENSES HUB */}
      {activeTab === 'projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem' }}>Active Field Projects</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Create social initiatives, update progress milestones, and log transparent fund utilization entries.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowExpenseModal(true)} className="btn btn-secondary">
                <Icons.FileText size={16} />
                <span>Log Expense Utilization</span>
              </button>
              <button onClick={() => setShowProjectModal(true)} className="btn btn-primary">
                <Icons.Plus size={16} />
                <span>Create New Project</span>
              </button>
            </div>
          </div>

          <div className="grid-2">
            {myProjects.map(p => (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {p.cause} • {p.location.city}
                  </span>
                  <StatusBadge status={p.status} />
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {p.description}
                </p>

                {/* Progress Indicators */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>Funding Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{p.fundingRaised.toLocaleString('en-IN')} / ₹{p.fundingTarget.toLocaleString('en-IN')} ({Math.min(Math.round((p.fundingRaised / p.fundingTarget) * 100), 100)}%)
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '6px', marginBottom: '0.75rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(Math.round((p.fundingRaised / p.fundingTarget) * 100), 100)}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>👥 Beneficiaries: <strong>{p.reachedBeneficiaries} / {p.targetBeneficiaries}</strong></span>
                    <span>🤝 Volunteers: <strong>{p.volunteersEnrolled} / {p.volunteersNeeded}</strong></span>
                  </div>
                </div>

                {/* Milestones checklist */}
                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Operational Milestones</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {p.milestones.map(m => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(p.id, m.id)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: m.isCompleted ? '#ecfdf5' : '#f8fafc',
                        border: `1px solid ${m.isCompleted ? '#a7f3d0' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {m.isCompleted ? <Icons.CheckCircle size={16} color="#059669" /> : <Icons.Clock size={16} color="#94a3b8" />}
                        <span style={{ fontWeight: 600, color: m.isCompleted ? '#065f46' : 'var(--text-main)' }}>{m.title}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>Target: {m.targetDate}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onNavigate('project_detail', p.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    View Public Dossier & Utilization
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VOLUNTEER DESK */}
      {activeTab === 'volunteers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem' }}>Volunteer Mobilization Desk</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Review incoming volunteer applications, prevent over-allocation, and log verified field service hours.
              </p>
            </div>
            <button onClick={() => setShowOppModal(true)} className="btn btn-primary">
              <Icons.Plus size={16} />
              <span>Create Volunteer Role</span>
            </button>
          </div>

          {/* Applications Table */}
          <div className="card" style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Volunteer Applications ({myApplications.length})</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Volunteer Name</th>
                    <th>Opportunity Role</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Hours Logged</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No volunteer applications received yet.
                      </td>
                    </tr>
                  ) : (
                    myApplications.map(app => (
                      <tr key={app.id}>
                        <td><strong>{app.volunteerName}</strong></td>
                        <td>{app.opportunityTitle}</td>
                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td><StatusBadge status={app.status} /></td>
                        <td><strong>{app.hoursLogged || 0} hrs</strong></td>
                        <td>
                          {app.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => updateApplicationStatus(app.id, 'ACCEPTED')}
                                className="btn btn-success btn-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                                className="btn btn-danger btn-sm"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {app.status === 'ACCEPTED' && (
                            <button
                              onClick={() => {
                                const hrs = prompt('Enter verified hours completed by this volunteer:', '4');
                                if (hrs) logVolunteerHours(app.id, parseFloat(hrs));
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              + Log Service Hours
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMPACT DOSSIER & STATUTORY REPORTS */}
      {activeTab === 'reports' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Statutory Impact Dossier Generator</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Compile verified field operations into an auditable PDF/print ready dossier aligned with MCA Section 135 CSR Schedule VII requirements.
          </p>

          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Executive Summary Preview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization</span>
                <div style={{ fontWeight: 700 }}>{currentUser.profile.organizationName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registration #</span>
                <div style={{ fontWeight: 600 }}>{currentUser.profile.ngoDetails?.registrationNumber}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Initiatives</span>
                <div style={{ fontWeight: 700 }}>{myProjects.length} Social Projects</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Beneficiaries</span>
                <div style={{ fontWeight: 700, color: '#059669' }}>
                  {myProjects.reduce((s, p) => s + p.reachedBeneficiaries, 0).toLocaleString('en-IN')}+ Lives Reached
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Icons.Download size={16} />
            <span>Export Official Statutory Impact Dossier (PDF / Print)</span>
          </button>
        </div>
      )}

      {/* MODAL 1: CREATE PROJECT */}
      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Create Social Project</h3>
              <button onClick={() => setShowProjectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Clean Drinking Water for Remote Delta Hamlets"
                  value={pTitle}
                  onChange={e => setPTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Problem Statement & Objective</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detail the target community need, intervention scope, and measurable targets..."
                  value={pDesc}
                  onChange={e => setPDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cause Category</label>
                  <select className="form-select" value={pCause} onChange={e => setPCause(e.target.value)}>
                    {CAUSES_LIST.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Funding Target (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={pBudget}
                    onChange={e => setPBudget(parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Beneficiaries</label>
                  <input
                    type="number"
                    className="form-input"
                    value={pBeneficiaries}
                    onChange={e => setPBeneficiaries(parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Volunteers Needed</label>
                  <input
                    type="number"
                    className="form-input"
                    value={pVols}
                    onChange={e => setPVols(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Active Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG EXPENSE UTILIZATION */}
      {showExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Log Fund Utilization</h3>
              <button onClick={() => setShowExpenseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icons.X size={20} />
              </button>
            </div>

            {expenseFeedback && (
              <div style={{ background: expenseFeedback.startsWith('✓') ? '#ecfdf5' : '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                {expenseFeedback}
              </div>
            )}

            <form onSubmit={handleExpenseSubmit}>
              <div className="form-group">
                <label className="form-label">Select Project</label>
                <select
                  className="form-select"
                  value={expenseProjectId}
                  onChange={e => setExpenseProjectId(e.target.value)}
                  required
                >
                  <option value="">Select Project...</option>
                  {myProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (Raised: ₹{p.fundingRaised.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expense Category</label>
                  <select
                    className="form-select"
                    value={expenseCategory}
                    onChange={e => setExpenseCategory(e.target.value as ExpenseCategory)}
                  >
                    <option value="DIRECT_RELIEF">Direct Relief / Beneficiary Aid</option>
                    <option value="MEDICAL_SUPPLIES">Medical Supplies / Surgery</option>
                    <option value="FOOD_PROVISIONS">Food Provisions / Grains</option>
                    <option value="EDUCATION_KITS">Education Kits & Tablets</option>
                    <option value="LOGISTICS_TRANSPORT">Logistics & Mobile Vans</option>
                    <option value="FIELD_EQUIPMENT">Field Equipment / Tools</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expenditure Amount (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 45000"
                    value={expenseAmount}
                    onChange={e => setExpenseAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vendor / Beneficiary Hospital</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. NRS Medical Trust / Philips MedTech"
                  value={expenseVendor}
                  onChange={e => setExpenseVendor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expenditure Purpose & Invoice Summary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Purchase of 200 pediatric insulin kits with GST invoice"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commit to Audited Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE VOLUNTEER OPPORTUNITY */}
      {showOppModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Create Volunteer Opportunity</h3>
              <button onClick={() => setShowOppModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOppSubmit}>
              <div className="form-group">
                <label className="form-label">Opportunity Role Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Weekend Coding Mentor / Triage Nurse Assistant"
                  value={oppTitle}
                  onChange={e => setOppTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Responsibilities, duration, required skills, and expected community contribution..."
                  value={oppDesc}
                  onChange={e => setOppDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Link to Project</label>
                  <select
                    className="form-select"
                    value={oppProjectId}
                    onChange={e => setOppProjectId(e.target.value)}
                  >
                    <option value="">Select Project...</option>
                    {myProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hard Slot Capacity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={oppCapacity}
                    onChange={e => setOppCapacity(parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Mode</label>
                  <select
                    className="form-select"
                    value={oppMode}
                    onChange={e => setOppMode(e.target.value as 'ON_FIELD' | 'REMOTE' | 'HYBRID')}
                  >
                    <option value="ON_FIELD">On Field</option>
                    <option value="REMOTE">Remote / Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowOppModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Open Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <NgoAssistantModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </div>
  );
};
