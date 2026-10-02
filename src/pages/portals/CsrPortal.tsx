import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/Badge';
import { CAUSES_LIST, STATES_AND_CITIES } from '../../data/causes';

export const CsrPortal: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const { projects, makeDonation, utilizations } = useData();
  const { currentUser } = useAuth();

  const [selectedCause, setSelectedCause] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [pledgeProjectId, setPledgeProjectId] = useState<string | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState(500000);
  const [csrSuccessMsg, setCsrSuccessMsg] = useState<string | null>(null);

  const csrDetails = currentUser.profile.csrDetails || {
    companyName: 'Tata Networks CSR Foundation',
    cinNumber: 'L72200DL1998PLC092144',
    annualBudget: 5000000,
    focusStates: ['West Bengal', 'Maharashtra'],
    preferredCauses: ['healthcare', 'education'],
    grantsCommitted: 1850000
  };

  const eligibleProjects = projects.filter(p => {
    const matchesCause = selectedCause === 'ALL' || p.cause === selectedCause;
    const matchesState = selectedState === 'ALL' || p.location.state === selectedState;
    return matchesCause && matchesState;
  });

  const handleGrantPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeProjectId || pledgeAmount <= 0) return;

    const donation = await makeDonation({
      projectId: pledgeProjectId,
      amount: pledgeAmount,
      paymentMethod: 'Corporate RTGS / MCA Wire',
      isAnonymous: false,
      donorMessage: `Schedule VII Institutional Grant by ${csrDetails.companyName}`
    });

    setCsrSuccessMsg(`✓ Grant of ₹${pledgeAmount.toLocaleString('en-IN')} committed successfully! Receipt: ${donation.receiptNumber}`);
    setPledgeProjectId(null);
  };

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-verified">Institutional CSR Suite</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              MCA CIN: {csrDetails.cinNumber}
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>{csrDetails.companyName}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Deploy corporate grants aligned with Section 135 Schedule VII obligations with itemized audit verification.
          </p>
        </div>

        <button onClick={() => window.print()} className="btn btn-secondary">
          <Icons.Download size={16} />
          <span>Export MCA Compliance Report</span>
        </button>
      </div>

      {csrSuccessMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{csrSuccessMsg}</span>
          <button onClick={() => setCsrSuccessMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icons.X size={18} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual CSR Budget</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
            ₹{csrDetails.annualBudget.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Statutory 2% Net Profit Allocation
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Committed Grants</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            ₹{csrDetails.grantsCommitted.toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
            ✓ Allocated to Verified 12A/80G NGOs
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining Mandate</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
            ₹{(csrDetails.annualBudget - csrDetails.grantsCommitted).toLocaleString('en-IN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Available for Q3/Q4 deployments
          </p>
        </div>
      </div>

      {/* Schedule VII Focus Filter */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>MCA Schedule VII Compliance Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mandated Cause Area</label>
            <select
              className="form-select"
              value={selectedCause}
              onChange={e => setSelectedCause(e.target.value)}
            >
              <option value="ALL">All Schedule VII Sectors</option>
              {CAUSES_LIST.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Priority CSR Geography</label>
            <select
              className="form-select"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
            >
              <option value="ALL">All Target States</option>
              {Object.keys(STATES_AND_CITIES).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Eligible Initiatives for CSR Grants */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Eligible Initiatives for Institutional Co-Funding</h2>
        <div className="grid-2">
          {eligibleProjects.map(p => (
            <div key={p.id} className="card card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {p.cause} • {p.location.city}
                </span>
                <StatusBadge status={p.status} />
              </div>

              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{p.title}</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Implementing NGO: <strong>{p.ngoName}</strong>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {p.description}
              </p>

              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span>Funding Gap</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{(p.fundingTarget - p.fundingRaised).toLocaleString('en-IN')} remaining of ₹{p.fundingTarget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="progress-bar-container" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(Math.round((p.fundingRaised / p.fundingTarget) * 100), 100)}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPledgeProjectId(p.id)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Commit CSR Grant
                </button>
                <button
                  onClick={() => onNavigate('project_detail', p.id)}
                  className="btn btn-secondary btn-sm"
                >
                  Audit Ledger
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audited Utilization Monitoring Table */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Corporate Audit & Statutory Ledger Feed</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
          Itemized expense entries across projects funded under CSR Section 135 mandates.
        </p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Vendor / Recipient</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {utilizations.slice(0, 5).map(u => (
                <tr key={u.id}>
                  <td>{u.spentDate}</td>
                  <td><span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>{u.category}</span></td>
                  <td>{u.vendorName}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{u.description}</td>
                  <td style={{ fontWeight: 700 }}>₹{u.amount.toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-verified" style={{ fontSize: '0.6875rem' }}>Audited & Verified</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Commitment Modal */}
      {pledgeProjectId && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Commit Institutional CSR Grant</h3>
              <button onClick={() => setPledgeProjectId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleGrantPledge}>
              <div className="form-group">
                <label className="form-label">Grant Amount (INR)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[250000, 500000, 1000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPledgeAmount(amt)}
                      className="btn"
                      style={{
                        background: pledgeAmount === amt ? 'var(--primary)' : '#f1f5f9',
                        color: pledgeAmount === amt ? '#fff' : 'var(--text-main)',
                        fontSize: '0.8125rem'
                      }}
                    >
                      ₹{(amt / 100000).toFixed(1)} Lakhs
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  className="form-input"
                  value={pledgeAmount}
                  onChange={e => setPledgeAmount(parseFloat(e.target.value))}
                  min="50000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Entity Approval Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CSR-COMM-2026-Q1-RES04"
                  defaultValue="CSR-COMMIT-2026-BOARD-APPROVAL"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setPledgeProjectId(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Institutional Grant Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
