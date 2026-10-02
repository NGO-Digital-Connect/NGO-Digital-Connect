import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/Badge';
import { MetricProgressBar } from '../../components/common/ProgressBar';
import type { Donation } from '../../types/models';

export const DonorPortal: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const { donations, projects } = useData();
  const { currentUser } = useAuth();
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);


  const myDonations = donations.filter(d => d.donorId === currentUser.id);
  const totalDonated = myDonations.reduce((sum, d) => sum + d.amount, 0);

  // Supported projects
  const supportedProjectIds = Array.from(new Set(myDonations.map(d => d.projectId)));
  const supportedProjects = projects.filter(p => supportedProjectIds.includes(p.id));

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-verified">Philanthropist Center</span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Welcome, {currentUser.profile.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Monitor the measurable progress of your supported initiatives, inspect expense utilization, and access certified 80G tax deduction receipts.
          </p>
        </div>

        <button onClick={() => onNavigate('projects')} className="btn btn-primary">
          <Icons.Plus size={16} />
          <span>Support Another Initiative</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Contributions</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            ₹{totalDonated.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across {supportedProjects.length} active initiatives
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Section 80G Receipts</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
            {myDonations.length} Issued
          </div>
          <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
            ✓ 100% Tax Exemption Eligible
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimated Beneficiaries</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
            {supportedProjects.reduce((sum, p) => sum + p.reachedBeneficiaries, 0)}+
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Direct lives touched by your funding
          </p>
        </div>
      </div>

      {/* 80G Tax Receipts Vault */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Certified 80G Tax Receipts Vault</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Valid under Section 80G of the Indian Income Tax Act for tax deductions.
            </p>
          </div>
          <span className="badge badge-verified">Income Tax Compliant</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Receipt Number</th>
                <th>Project Supported</th>
                <th>Managing NGO</th>
                <th>Date</th>
                <th>Contribution</th>
                <th>Payment Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No donations recorded yet. Explore our active projects to make your first contribution!
                  </td>
                </tr>
              ) : (
                myDonations.map(d => (
                  <tr key={d.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{d.receiptNumber}</strong></td>
                    <td>{d.projectTitle}</td>
                    <td>{d.ngoName}</td>
                    <td>{new Date(d.donatedAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>₹{d.amount.toLocaleString('en-IN')}</td>
                    <td><span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>{d.paymentMethod}</span></td>
                    <td>
                      <button
                        onClick={() => setSelectedReceipt(d)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Icons.Download size={14} />
                        <span>View Certificate</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supported Projects Portfolio */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Initiatives in Your Philanthropic Portfolio</h2>
        <div className="grid-2">
          {supportedProjects.map(p => (
            <div key={p.id} className="card card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {p.cause} • {p.location.city}
                </span>
                <StatusBadge status={p.status} />
              </div>

              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{p.title}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Conducted by {p.ngoName}
              </p>

              <MetricProgressBar
                label="Funding Raised"
                current={p.fundingRaised}
                target={p.fundingTarget}
                unitPrefix="₹"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                <span>👥 {p.reachedBeneficiaries} / {p.targetBeneficiaries} helped</span>
                <span>🤝 {p.volunteersEnrolled} / {p.volunteersNeeded} volunteers</span>
              </div>

              <button
                onClick={() => onNavigate('project_detail', p.id)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Inspect Real-Time Expenses & Evidence
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icons.ShieldCheck size={24} color="#059669" />
                <h3 style={{ fontSize: '1.25rem' }}>Official 80G Tax Exemption Certificate</h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icons.X size={20} />
              </button>
            </div>

            <div style={{ border: '2px solid #059669', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: '#fcfdfd', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.125rem', color: '#065f46' }}>{selectedReceipt.ngoName}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Society / Non-Profit Trust</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  Certificate No: {selectedReceipt.receiptNumber}
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Donor Name:</strong> {selectedReceipt.donorName}</div>
                <div><strong>Date of Transaction:</strong> {new Date(selectedReceipt.donatedAt).toLocaleDateString()}</div>
                <div><strong>Project Supported:</strong> {selectedReceipt.projectTitle}</div>
                <div><strong>Amount Donated:</strong> <span style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>₹{selectedReceipt.amount.toLocaleString('en-IN')} INR</span></div>
                <div><strong>Payment Channel:</strong> {selectedReceipt.paymentMethod}</div>
                <div><strong>Section 80G Validity:</strong> Verified under Section 80G(5)(vi) of Income Tax Act 1961</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedReceipt(null)} className="btn btn-secondary">
                Close
              </button>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Icons.Download size={16} />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
