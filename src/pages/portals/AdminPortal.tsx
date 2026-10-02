import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/Badge';
export const AdminPortal: React.FC = () => {
  const { auditLogs, complaints, resolveComplaint, updateNgoVerification } = useData();
  const { allUsers } = useAuth();

  const [activeTab, setActiveTab] = useState<'verification' | 'moderation' | 'audit' | 'users'>('verification');
  const [resolutionInput, setResolutionInput] = useState<{ [id: string]: string }>({});

  const ngoUsers = allUsers.filter(u => u.role === 'NGO');

  const handleResolveComplaint = (id: string) => {
    const note = resolutionInput[id] || 'Investigated and marked compliant by platform oversight.';
    resolveComplaint(id, note);
  };

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-critical">Platform Oversight & Governance</span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Administrator Control Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Accredit non-profit entities, investigate community complaints, oversee user permissions, and inspect immutable audit ledgers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-verified" style={{ padding: '0.5rem 0.75rem' }}>
            ✓ Platform Integrity Guard Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('verification')}
          className={`btn ${activeTab === 'verification' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.ShieldCheck size={16} />
          <span>NGO Verification Queue ({ngoUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`btn ${activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.ShieldAlert size={16} />
          <span>Moderation & Complaints ({complaints.filter(c => c.status === 'OPEN').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.FileText size={16} />
          <span>Immutable Audit Ledger ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Icons.Users size={16} />
          <span>All User Accounts ({allUsers.length})</span>
        </button>
      </div>

      {/* TAB 1: NGO VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>NGO Accreditation & KYC Review Queue</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Ensure non-profits meet statutory 12A, 80G, and MCA CSR-1 standards before granting the platform Verified Trust Badge.
            </p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Organization Name</th>
                  <th>Reg Number</th>
                  <th>Location</th>
                  <th>80G Status</th>
                  <th>CSR-1 Number</th>
                  <th>Accreditation State</th>
                  <th>Governance Actions</th>
                </tr>
              </thead>
              <tbody>
                {ngoUsers.map(ngo => {
                  const details = ngo.profile.ngoDetails!;
                  return (
                    <tr key={ngo.id}>
                      <td>
                        <strong>{ngo.profile.organizationName}</strong>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Lead: {ngo.profile.name}</div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>{details.registrationNumber}</td>
                      <td>{ngo.profile.city}, {ngo.profile.state}</td>
                      <td>
                        {details.taxExemption80G ? (
                          <span className="badge badge-verified" style={{ fontSize: '0.6875rem' }}>✓ 80G Certified</span>
                        ) : (
                          <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>{details.csr1Number || 'None'}</td>
                      <td><StatusBadge status={details.verificationStatus} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => updateNgoVerification(ngo.id, 'VERIFIED')}
                            className="btn btn-success btn-sm"
                            disabled={details.verificationStatus === 'VERIFIED'}
                          >
                            Approve Badge
                          </button>
                          <button
                            onClick={() => updateNgoVerification(ngo.id, 'SUSPENDED')}
                            className="btn btn-danger btn-sm"
                            disabled={details.verificationStatus === 'SUSPENDED'}
                          >
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MODERATION & COMPLAINTS */}
      {activeTab === 'moderation' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Community Reports & Dispute Resolution</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Investigate flagged initiatives, suspicious campaigns, or incorrect field coordinates.
            </p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reported Target</th>
                  <th>Reporter</th>
                  <th>Reason</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Resolution Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No community disputes or complaints on record.
                    </td>
                  </tr>
                ) : (
                  complaints.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.targetTitle}</strong>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Type: {c.targetType}</div>
                      </td>
                      <td>{c.reporterName}</td>
                      <td><strong style={{ color: 'var(--danger)' }}>{c.reason}</strong></td>
                      <td style={{ fontSize: '0.8125rem' }}>{c.description}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        {c.status === 'OPEN' ? (
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Enter resolution findings..."
                            value={resolutionInput[c.id] || ''}
                            onChange={e => setResolutionInput({ ...resolutionInput, [c.id]: e.target.value })}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.resolutionNote}</span>
                        )}
                      </td>
                      <td>
                        {c.status === 'OPEN' && (
                          <button
                            onClick={() => handleResolveComplaint(c.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Mark Resolved
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
      )}

      {/* TAB 3: IMMUTABLE AUDIT LEDGER */}
      {activeTab === 'audit' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Platform-Wide Audit Trail</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Every case triage, project creation, donation receipt, and accreditation event is recorded immutably.
              </p>
            </div>
            <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
              <Icons.Download size={14} />
              <span>Export Audit Trail</span>
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td><strong>{log.actorName}</strong></td>
                    <td><span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>{log.actorRole}</span></td>
                    <td><strong style={{ color: 'var(--primary)' }}>{log.action}</strong></td>
                    <td>{log.targetEntity} #{log.targetId}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Registered Stakeholder Accounts</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Full directory of active beneficiaries, NGO directors, volunteers, donors, CSR entities, and government officers.
            </p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name & Organization</th>
                  <th>Role</th>
                  <th>Contact Email</th>
                  <th>Location</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.profile.name}</strong>
                      {u.profile.organizationName && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{u.profile.organizationName}</div>
                      )}
                    </td>
                    <td><span className="badge badge-active" style={{ fontSize: '0.6875rem' }}>{u.role}</span></td>
                    <td style={{ fontSize: '0.8125rem' }}>{u.email}</td>
                    <td>{u.profile.city}, {u.profile.state}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><StatusBadge status={u.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
