import React from 'react';
import { Icons } from './Icons';
import { useData } from '../../store/DataContext';
import { useTranslation } from '../../i18n/LanguageContext';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { resetAllPlatformData } = useData();
  const { t } = useTranslation();

  return (
    <footer style={{ background: 'var(--footer-bg)', color: '#94a3b8', borderTop: '1px solid var(--border)', marginTop: 'auto', padding: '3.5rem 0 2rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand & Vision */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', marginBottom: '1rem' }}>
              <Icons.Heart size={24} color="#38bdf8" />
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>NGO DIGITAL CONNECT</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem', color: '#cbd5e1' }}>
              {t('footer.brandVision', 'A unified social impact platform transforming fragmented philanthropy into a connected, traceable journey:')}
              <strong style={{ color: '#38bdf8', display: 'block', marginTop: '0.25rem' }}>
                {t('footer.traceableJourney', 'Need → Action → Impact')}
              </strong>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-verified" style={{ fontSize: '0.6875rem' }}>
                {t('footer.traceable100', '100% Traceable')}
              </span>
              <span className="badge badge-active" style={{ fontSize: '0.6875rem' }}>
                {t('footer.scheduleVII', 'Schedule VII Aligned')}
              </span>
            </div>
          </div>

          {/* Quick Ecosystem Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.publicPlatform', 'Public Platform')}
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  {t('footer.homeLink', 'Ecosystem Home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ngos')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  {t('footer.ngosLink', 'Verified NGOs Directory')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('projects')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  {t('footer.projectsLink', 'Social Impact Projects')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  {t('footer.opportunitiesLink', 'Volunteer Opportunities')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('impact')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  {t('footer.impactLink', 'Verifiable Impact Analytics')}
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Privacy Guard */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.trustPrivacy', 'Trust & Privacy')}
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Icons.ShieldCheck size={18} color="#34d399" />
              <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#ffffff' }}>{t('footer.privacyRuleTitle', 'Beneficiary Seclusion Rule:')} </strong>
                {t('footer.privacyRuleDesc', 'Personal identifiers, contacts & medical files are never exposed publicly.')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Icons.FileText size={18} color="#60a5fa" />
              <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#ffffff' }}>{t('footer.auditFundTitle', 'Audited Fund Utilization:')} </strong>
                {t('footer.auditFundDesc', 'Every rupee utilized is backed by vendor invoices & milestone proofs.')}
              </span>
            </div>
          </div>

          {/* Interactive Testing Controls */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('footer.devTools', 'Developer & Demo Tools')}
            </h4>
            <p style={{ fontSize: '0.8125rem', marginBottom: '0.875rem', color: '#94a3b8' }}>
              {t('footer.devToolsDesc', 'Reset local storage to original seed state to re-run demo workflows from scratch.')}
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all cases, donations, and progress to default seed data?')) {
                  resetAllPlatformData();
                  alert('Platform database reset to initial demonstration state.');
                }
              }}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              {t('footer.resetSeedBtn', 'Reset Seed Data')}
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <div>© {new Date().getFullYear()} {t('footer.copyright', 'NGO Digital Connect Platform. Dedicated to transparent community empowerment.')}</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>{t('footer.compliance12A', 'Verified 12A / 80G Compliant')}</span>
            <span>•</span>
            <span>{t('footer.complianceCSR', 'MCA CSR-1 Registry Aligned')}</span>
            <span>•</span>
            <span>{t('footer.complianceLedger', 'Auditable Impact Ledger')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
