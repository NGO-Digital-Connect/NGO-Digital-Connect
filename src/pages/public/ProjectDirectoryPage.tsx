import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import { CAUSES_LIST, STATES_AND_CITIES } from '../../data/causes';
import { StatusBadge } from '../../components/common/Badge';

export const ProjectDirectoryPage: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const { projects } = useData();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCause, setSelectedCause] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ngoName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCause = selectedCause === 'ALL' || p.cause === selectedCause;
    const matchesState = selectedState === 'ALL' || p.location.state === selectedState;

    return matchesSearch && matchesCause && matchesState;
  });

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
          {t('footer.projectsLink', 'Social Impact Projects')}
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px' }}>
          {t('home.featuredProjectsSubtitle', 'Explore field initiatives with multi-metric progress tracking. Track capital raised, volunteer mobilization, and verified beneficiary outcomes in real-time.')}
        </p>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-card)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('common.search', 'Search Initiatives')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('common.search', 'Title, NGO, keywords...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>
                <Icons.Search size={16} />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('common.category', 'Cause Category')}</label>
            <select
              className="form-select"
              value={selectedCause}
              onChange={e => setSelectedCause(e.target.value)}
            >
              <option value="ALL">{t('common.allCauses', 'All Causes')}</option>
              {CAUSES_LIST.map(c => (
                <option key={c.id} value={c.id}>{t('causes.' + c.id, c.name)}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('common.location', 'Geography')}</label>
            <select
              className="form-select"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
            >
              <option value="ALL">{t('common.allStates', 'All States')}</option>
              {Object.keys(STATES_AND_CITIES).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid-3">
        {filteredProjects.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)' }}>
            <Icons.Target size={48} color="var(--text-light)" />
            <h3 style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              {t('common.noResults', 'No projects match the criteria')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
              {t('common.clearFilters', 'Try clearing your filters.')}
            </p>
          </div>
        ) : (
          filteredProjects.map(p => {
            const fundingPercent = Math.min(Math.round((p.fundingRaised / p.fundingTarget) * 100), 100);
            const causeLocalized = t(`causes.${p.cause}`, p.cause);

            return (
              <div key={p.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                <div style={{ height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', position: 'relative' }}>
                  <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {causeLocalized} • {p.location.city}
                </div>

                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', lineHeight: '1.3', color: 'var(--secondary)' }}>
                  {p.title}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {t('common.organization', 'Managed by')} <strong>{p.ngoName}</strong>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>

                {/* Multi-Metric Balance Card */}
                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{t('common.raised', 'Funding Raised')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ₹{p.fundingRaised.toLocaleString('en-IN')} / ₹{p.fundingTarget.toLocaleString('en-IN')} ({fundingPercent}%)
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '6px', marginBottom: '0.75rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${fundingPercent}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                    <span>👥 <strong>{p.reachedBeneficiaries}</strong> / {p.targetBeneficiaries} {t('common.title', 'reached')}</span>
                    <span>🤝 <strong>{p.volunteersEnrolled}</strong> / {p.volunteersNeeded} {t('common.slots', 'vols')}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('project_detail', p.id)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {t('common.viewDetails', 'Inspect Dossier & Support')}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
