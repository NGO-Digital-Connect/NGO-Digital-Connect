import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { StatusBadge } from '../../components/common/Badge';
import type { Project, HelpRequest, UserAccount } from '../../types/models';

export const GovernmentPortal: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const { projects, cases, globalMetrics, allUsers } = useData();
  const { currentUser } = useAuth();
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  const govDetails = currentUser.profile.governmentDetails || {
    department: 'Dept. of Social Welfare & Disaster Management',
    officialJurisdiction: 'Kolkata & Suburbs District Unit',
    designation: 'Joint Director of Monitoring',
    authorizedIdNumber: 'GOV-WB-SW-2021-994'
  };

  const verifiedNgos = (allUsers || []).filter((u: UserAccount) => u.role === 'NGO');

  const districts = ['Kolkata', 'Mumbai', 'New Delhi', 'Howrah', 'Pune'];

  const filteredProjects = projects.filter((p: Project) =>
    selectedDistrict === 'ALL' || p.location.city === selectedDistrict
  );

  const districtCases = cases.filter((c: HelpRequest) =>
    selectedDistrict === 'ALL' || c.location.city === selectedDistrict
  );

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-verified">Institutional Monitoring Suite</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Auth ID: {govDetails.authorizedIdNumber}
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>{govDetails.department}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Official Jurisdiction: <strong>{govDetails.officialJurisdiction}</strong>. Macro-level welfare density, verified non-profit coordination, and non-duplication oversight.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Jurisdiction:</label>
          <select
            className="form-select"
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            style={{ width: 'auto', fontWeight: 600 }}
          >
            <option value="ALL">All Operational Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Institutional Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ background: '#f8fafc' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Active Social Projects</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>{filteredProjects.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>Non-profit partnerships</div>
        </div>

        <div className="card" style={{ background: '#f8fafc' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Reported Citizen Cases</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>{districtCases.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Inter-agency queue</div>
        </div>

        <div className="card" style={{ background: '#f8fafc' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Total Aid Disbursed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
            ₹{globalMetrics.totalFundsRaised.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>Verified public & CSR capital</div>
        </div>

        <div className="card" style={{ background: '#f8fafc' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Accredited NGOs (State)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>{verifiedNgos.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>12A / 80G Audited</div>
        </div>
      </div>

      {/* Welfare Initiatives & Transparency Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Deployment Portfolio in {selectedDistrict}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Cross-verifying target outcomes against municipal records.</p>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Executing NGO</th>
                <th>Location</th>
                <th>Sector</th>
                <th>Beneficiaries</th>
                <th>Funding Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p: Project) => (
                <tr key={p.id}>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.ngoName}</td>
                  <td>📍 {p.location.city}, {p.location.state}</td>
                  <td><span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>{p.cause}</span></td>
                  <td><strong>{p.reachedBeneficiaries}</strong> / {p.targetBeneficiaries}</td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      ₹{p.fundingRaised.toLocaleString('en-IN')} / ₹{p.fundingTarget.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onNavigate('project_detail', p.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Inspect Audit Trail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Welfare Needs & Non-Duplication Review */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Social Needs Heatmap & Triage Status</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
          Anonymized overview of citizen needs in {selectedDistrict === 'ALL' ? 'all districts' : selectedDistrict} for inter-agency coordination.
        </p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Case Ref</th>
                <th>Category</th>
                <th>Urgency</th>
                <th>Assigned Organization</th>
                <th>State & City</th>
                <th>Current Lifecycle</th>
              </tr>
            </thead>
            <tbody>
              {districtCases.slice(0, 6).map((c: HelpRequest) => (
                <tr key={c.id}>
                  <td><strong>#{c.id}</strong></td>
                  <td>{c.category}</td>
                  <td><span className={`badge ${c.urgency === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>{c.urgency}</span></td>
                  <td>{c.assignedNgoName || 'Pending Coordination'}</td>
                  <td>{c.location.city}, {c.location.state}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
