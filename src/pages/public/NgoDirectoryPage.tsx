import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useData } from '../../store/DataContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import { CAUSES_LIST, STATES_AND_CITIES } from '../../data/causes';
import { StatusBadge } from '../../components/common/Badge';

export const NgoDirectoryPage: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const { allUsers } = useAuth();
  const { projects } = useData();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCause, setSelectedCause] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [onlyVerified, setOnlyVerified] = useState(false);

  const ngos = allUsers.filter(u => u.role === 'NGO');

  const filteredNgos = ngos.filter(ngo => {
    const details = ngo.profile.ngoDetails;
    if (!details) return false;

    // Search filter
    const matchesSearch = 
      (ngo.profile.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (details.mission?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (details.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    // Cause filter
    const matchesCause = selectedCause === 'ALL' || details.causes.includes(selectedCause);

    // State filter
    const matchesState = selectedState === 'ALL' || ngo.profile.state === selectedState;

    // Verification filter
    const matchesVerified = !onlyVerified || details.verificationStatus === 'VERIFIED';

    return matchesSearch && matchesCause && matchesState && matchesVerified;
  });

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Title & Narrative */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
          {t('footer.ngosLink', 'Verified NGO Directory')}
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px' }}>
          {t('home.verifiedNgosSubtitle', 'Discover accredited non-profit organizations working across key social causes. Every listed NGO undergoes strict 12A/80G tax and CSR-1 verification.')}
        </p>
      </div>

      {/* Filter Surface */}
      <div className="card" style={{ marginBottom: '2rem', background: 'var(--bg-card)', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          {/* Search Box */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('common.search', 'Search Organization')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('common.search', 'Name, reg number, mission...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>
                <Icons.Search size={16} />
              </div>
            </div>
          </div>

          {/* Cause Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('common.category', 'Cause Focus')}</label>
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

          {/* State Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('auth.state', 'Operating State')}</label>
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

          {/* Verified Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem' }}>
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={onlyVerified}
              onChange={e => setOnlyVerified(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="verifiedOnly" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
              {t('common.verifiedOnly', 'Verified Trust Badge Only')}
            </label>
          </div>
        </div>
      </div>

      {/* NGO Grid */}
      <div className="grid-2">
        {filteredNgos.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)' }}>
            <Icons.Building size={48} color="var(--text-light)" />
            <h3 style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              {t('common.noResults', 'No organizations found matching your criteria.')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
              {t('common.clearFilters', 'Try broadening your search or resetting filters.')}
            </p>
          </div>
        ) : (
          filteredNgos.map(ngo => {
            const details = ngo.profile.ngoDetails!;
            const ngoProjects = projects.filter(p => p.ngoId === ngo.id);

            return (
              <div key={ngo.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>
                      {ngo.profile.organizationName}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <Icons.MapPin size={14} />
                      <span>{ngo.profile.city}, {ngo.profile.state}</span>
                      <span>•</span>
                      <span>Est. {details.foundedYear}</span>
                    </div>
                  </div>
                  <StatusBadge status={details.verificationStatus} />
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem', flex: 1 }}>
                  {details.mission}
                </p>

                {/* Compliance & Causes Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {details.taxExemption80G && (
                    <span className="badge badge-verified" style={{ fontSize: '0.6875rem' }}>
                      ✓ 80G {t('common.status', 'Tax Exemption')}
                    </span>
                  )}
                  {details.csr1Number && (
                    <span className="badge badge-active" style={{ fontSize: '0.6875rem' }}>
                      MCA CSR-1: {details.csr1Number}
                    </span>
                  )}
                  {details.causes.map(c => (
                    <span key={c} className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                      {t('causes.' + c, c.replace('_', ' '))}
                    </span>
                  ))}
                </div>

                {/* Stats Ledger */}
                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', border: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                      {t('home.beneficiariesReached', 'Served')}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>{details.totalBeneficiariesServed.toLocaleString('en-IN')}+</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                      {t('home.activeProjects', 'Active Projects')}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{ngoProjects.length} {t('nav.projects', 'Projects')}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                      {t('auth.regNumber', 'Reg Number')}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.75rem' }}>{details.registrationNumber}</div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('ngo_detail', ngo.id)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {t('common.viewDetails', 'Inspect Complete Dossier')}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
