import React from 'react';
import { useData } from '../../store/DataContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';

export const ImpactPage: React.FC = () => {
  const { globalMetrics, auditLogs } = useData();
  const { t } = useTranslation();

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center', maxWidth: '760px', margin: '0 auto 2.5rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
          <Icons.Award size={16} />
          <span>{t('footer.impactLink', 'Verifiable Ecosystem Metrics')}</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
          {t('footer.complianceLedger', 'Ecosystem Impact Ledger')}
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
          {t('home.heroSubtitle', 'Real social transformation measured directly from ground-level actions, verified hospital procedures, completed schools, and audited expense vouchers.')}
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--primary)', background: 'var(--bg-card)' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.Users size={32} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {globalMetrics.peopleHelped.toLocaleString('en-IN')}+
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('home.beneficiariesReached', 'Verified Lives Impacted')}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #059669', background: 'var(--bg-card)' }}>
          <div style={{ color: '#059669', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.IndianRupee size={32} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
            ₹{globalMetrics.totalFundsRaised.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('home.capitalMobilized', 'Capital Disbursed')}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #7c3aed', background: 'var(--bg-card)' }}>
          <div style={{ color: '#7c3aed', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.Clock size={32} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {globalMetrics.volunteerHoursLogged} hrs
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('portals.volunteer.loggedHoursCard', 'Verified Field Hours')}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #ea580c', background: 'var(--bg-card)' }}>
          <div style={{ color: '#ea580c', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            <Icons.Target size={32} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {globalMetrics.casesResolved}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('portals.government.resolvedGrievances', 'Critical Cases Resolved')}
          </div>
        </div>
      </div>

      {/* Financial Accountability Split */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)' }}>
              {t('footer.auditFundTitle', 'Financial Traceability & Utilization Ratio')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Comparison of total philanthropic funds mobilized versus itemized utilization vouchers logged by NGOs.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
              {Math.min(Math.round((globalMetrics.totalFundsUtilized / (globalMetrics.totalFundsRaised || 1)) * 100), 100)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Utilization Rate</div>
          </div>
        </div>

        <div className="progress-bar-container" style={{ height: '14px', marginBottom: '1.25rem' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(Math.round((globalMetrics.totalFundsUtilized / (globalMetrics.totalFundsRaised || 1)) * 100), 100)}%`,
              backgroundColor: '#059669'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('common.raised', 'Total Inflow')}</span>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--primary)' }}>
              ₹{globalMetrics.totalFundsRaised.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('portals.ngo.utilizationTab', 'Audited Outflow')}</span>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#059669' }}>
              ₹{globalMetrics.totalFundsUtilized.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Escrow & Active Liquidity</span>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--secondary)' }}>
              ₹{(globalMetrics.totalFundsRaised - globalMetrics.totalFundsUtilized).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Live Operational Audit Stream */}
      <div className="card" style={{ background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>
              {t('portals.admin.auditLedger', 'Live Platform Transparency Audit Stream')}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Immutable chronicle of state transitions, case resolutions, volunteer approvals, and capital allocations.
            </p>
          </div>
          <span className="badge badge-verified">
            ✓ {t('footer.complianceLedger', 'Public Ledger')}
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('common.date', 'Timestamp')}</th>
                <th>{t('common.name', 'Actor')}</th>
                <th>{t('common.actions', 'Action Type')}</th>
                <th>{t('common.title', 'Target Entity')}</th>
                <th>{t('common.description', 'Operational Details')}</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 8).map(log => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <strong>{log.actorName}</strong>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-light)' }}>{log.actorRole}</div>
                  </td>
                  <td>
                    <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.targetEntity} #{log.targetId}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
