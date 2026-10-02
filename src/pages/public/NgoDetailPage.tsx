import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { useData } from '../../store/DataContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/Badge';

export const NgoDetailPage: React.FC<{
  ngoId: string;
  onNavigate: (view: string, id?: string) => void;
}> = ({ ngoId, onNavigate }) => {
  const { allUsers } = useAuth();
  const { projects, opportunities } = useData();
  const { t } = useTranslation();

  const ngo = allUsers.find(u => u.id === ngoId || u.profile.ngoDetails?.ngoId === ngoId);
  if (!ngo || !ngo.profile.ngoDetails) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--secondary)' }}>{t('common.noResults', 'NGO Not Found')}</h2>
        <button onClick={() => onNavigate('ngos')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          {t('common.back', 'Back to Directory')}
        </button>
      </div>
    );
  }

  const details = ngo.profile.ngoDetails;
  const ngoProjects = projects.filter(p => p.ngoId === ngo.id);
  const ngoOpps = opportunities.filter(o => o.ngoId === ngo.id && o.status === 'OPEN');

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Breadcrumb */}
      <button
        onClick={() => onNavigate('ngos')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
      >
        <Icons.ArrowLeft size={16} />
        <span>{t('common.back', 'Back')}</span>
      </button>

      {/* Header Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--secondary)' }}>{ngo.profile.organizationName}</h1>
              <StatusBadge status={details.verificationStatus} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icons.MapPin size={16} /> {ngo.profile.city}, {ngo.profile.state}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icons.Calendar size={16} /> {t('auth.foundedYear', 'Founded')} {details.foundedYear}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Icons.Users size={16} /> {ngo.profile.name} ({ngo.profile.designation})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {details.taxExemption80G && (
              <span className="badge badge-verified" style={{ padding: '0.5rem 0.75rem' }}>
                ✓ 80G Certified
              </span>
            )}
            {details.csr1Number && (
              <span className="badge badge-active" style={{ padding: '0.5rem 0.75rem' }}>
                MCA CSR-1 Registered
              </span>
            )}
          </div>
        </div>

        <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)', opacity: 0.5 }} />

        {/* Mission & Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
              {t('common.title', 'Organizational Mission')}
            </h3>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.9375rem' }}>
              {details.mission}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
              {t('common.status', 'Statutory & Legal Identifiers')}
            </h3>
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>{t('auth.regNumber', 'Registration No')}:</strong> {details.registrationNumber}</div>
              <div><strong>MCA CSR-1 No:</strong> {details.csr1Number || 'Under Review'}</div>
              <div><strong>{t('common.location', 'Service Areas')}:</strong> {details.serviceAreas.join(', ')}</div>
              <div><strong>{t('common.phone', 'Official Contact')}:</strong> {ngo.profile.phone} ({ngo.email})</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
          {t('home.activeProjects', 'Active Social Projects')} ({ngoProjects.length})
        </h2>
        <div className="grid-2">
          {ngoProjects.map(p => {
            const causeLocalized = t(`causes.${p.cause}`, p.cause);
            return (
              <div key={p.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {causeLocalized}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>{p.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
                  {p.description}
                </p>

                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{t('common.raised', 'Funding Progress')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{p.fundingRaised.toLocaleString('en-IN')} / ₹{p.fundingTarget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '6px' }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(Math.round((p.fundingRaised / p.fundingTarget) * 100), 100)}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('project_detail', p.id)}
                  className="btn btn-primary"
                >
                  {t('common.donate', 'Inspect Project Ledger & Donate')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Volunteer Opportunities */}
      {ngoOpps.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
            {t('nav.opportunities', 'Open Volunteer Roles')} ({ngoOpps.length})
          </h2>
          <div className="grid-2">
            {ngoOpps.map(opp => (
              <div key={opp.id} className="card card-hover" style={{ background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-active">{opp.location.mode}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {opp.slotsFilled} / {opp.slotsTotal} {t('common.slots', 'slots filled')}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.35rem', color: 'var(--secondary)' }}>{opp.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {opp.description}
                </p>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  {t('common.apply', 'Apply in Opportunities Hub')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
