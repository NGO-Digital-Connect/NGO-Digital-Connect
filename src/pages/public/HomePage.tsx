import React from 'react';
import { Icons } from '../../components/common/Icons';
import { useData } from '../../store/DataContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { CAUSES_LIST } from '../../data/causes';
import { StatusBadge } from '../../components/common/Badge';
import type { Project } from '../../types/models';

export const HomePage: React.FC<{ onNavigate: (view: string, id?: string) => void }> = ({ onNavigate }) => {
  const { globalMetrics, projects } = useData();
  const { t } = useTranslation();

  return (
    <div className="animate-fade">
      {/* Hero Section */}
      <section style={{ background: 'var(--hero-gradient)', padding: '4.5rem 0 3.5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
            <Icons.ShieldCheck size={16} color="var(--primary)" />
            <span>{t('home.heroBadge', 'The Traceable Social Impact Ecosystem')}</span>
          </div>

          <h1 style={{ fontSize: '3rem', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '1.25rem', color: 'var(--secondary)' }}>
            {t('home.heroTitle1', 'Connecting People.')} <br />
            <span style={{ color: 'var(--primary)' }}>{t('home.heroTitle2', 'Empowering Communities.')}</span> <br />
            {t('home.heroTitle3', 'Creating Measurable Impact.')}
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2.25rem' }}>
            {t('home.heroSubtitle', 'NGO Digital Connect unites beneficiaries, grassroots NGOs, volunteers, donors, CSR organizations, and institutions into a single verifiable lifecycle.')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('portal_beneficiary')} className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
              <Icons.Plus size={18} />
              <span>{t('home.requestHelp', 'Request Help')}</span>
            </button>
            <button onClick={() => onNavigate('opportunities')} className="btn btn-success btn-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
              <Icons.HandHeart size={18} />
              <span>{t('home.volunteerSkills', 'Volunteer Skills')}</span>
            </button>
            <button onClick={() => onNavigate('projects')} className="btn btn-secondary btn-lg">
              <Icons.Target size={18} />
              <span>{t('home.exploreProjects', 'Explore Projects')}</span>
            </button>
            <button onClick={() => onNavigate('ngos')} className="btn btn-secondary btn-lg">
              <Icons.Building size={18} />
              <span>{t('home.exploreNgos', 'Explore NGOs')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Ecosystem Metrics Bar */}
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>
                {globalMetrics.peopleHelped.toLocaleString('en-IN')}+
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('home.beneficiariesReached', 'Beneficiaries Reached')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80' }}>
                ₹{globalMetrics.totalFundsRaised.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('home.capitalMobilized', 'Capital Mobilized')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f472b6' }}>
                {globalMetrics.volunteersEngaged}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('home.volunteersEngaged', 'Volunteers Engaged')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
                {globalMetrics.activeProjects}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('home.activeProjects', 'Active Field Projects')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa' }}>
                {globalMetrics.communitiesReached}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('home.districtsReached', 'Districts Reached')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Loop: Need -> Action -> Impact */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('home.howItWorksSubtitle', 'The Operational Architecture')}
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
              {t('home.howItWorksTitle', 'The Traceable Need → Action → Impact Journey')}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {t('home.heroSubtitle', 'Unlike static directories, NGO Digital Connect maintains an unbroken, auditable link from an expressed human need to verified community outcome.')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Step 1: Need */}
            <div className="card" style={{ borderTop: '4px solid #ef4444' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icons.AlertCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                {t('home.step1Title', '1. Request & Triage')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                {t('home.step1Desc', 'Beneficiaries submit requests with privacy seclusion. Local NGOs review and verify legitimacy.')}
              </p>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-main)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>✓ Structured category & urgency triage</li>
                <li>✓ Document verification with zero public PII exposure</li>
                <li>✓ Automatic caseworker assignment</li>
              </ul>
            </div>

            {/* Step 2: Action */}
            <div className="card" style={{ borderTop: '4px solid #3b82f6' }}>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icons.Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                {t('home.step2Title', '2. Mobilize & Execute')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                {t('home.step2Desc', 'Donors and CSRs fund milestones while volunteers offer on-the-ground support and skills.')}
              </p>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-main)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>✓ Direct donor & CSR project commitments</li>
                <li>✓ Enrolled volunteer coordination</li>
                <li>✓ Phase-by-phase execution tracking</li>
              </ul>
            </div>

            {/* Step 3: Impact */}
            <div className="card" style={{ borderTop: '4px solid #10b981' }}>
              <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icons.Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                {t('home.step3Title', '3. Trace & Audit')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
                {t('home.step3Desc', 'Every rupee spent is linked to vendor invoices, geotagged receipts, and public impact metrics.')}
              </p>
              <ul style={{ fontSize: '0.8125rem', color: 'var(--text-main)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>✓ Verifiable photo & field resolution proofs</li>
                <li>✓ Audited fund utilization ledger</li>
                <li>✓ 80G tax certificates and MCA CSR-1 reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Social Projects */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase' }}>
                {t('home.causesTitle', 'Active Initiatives')}
              </span>
              <h2 style={{ fontSize: '1.875rem', marginTop: '0.25rem', color: 'var(--secondary)' }}>
                {t('home.featuredProjectsTitle', 'Featured High-Impact Projects')}
              </h2>
            </div>
            <button onClick={() => onNavigate('projects')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{t('home.viewAllProjects', 'View All Projects')}</span>
              <Icons.ArrowRight size={16} />
            </button>
          </div>

          <div className="grid-3">
            {projects.slice(0, 3).map((p: Project) => {
              const causeLocalized = t(`causes.${p.cause}`, p.cause);
              return (
                <div key={p.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', position: 'relative' }}>
                    <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {causeLocalized} • {p.location.city}
                  </div>

                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', lineHeight: '1.3', color: 'var(--secondary)' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>

                  {/* Progress Indicators */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{t('common.raised', 'Funding Raised')}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        ₹{p.fundingRaised.toLocaleString('en-IN')} / ₹{p.fundingTarget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${Math.min(Math.round((p.fundingRaised / p.fundingTarget) * 100), 100)}%` }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                      <span>👥 {p.reachedBeneficiaries} / {p.targetBeneficiaries} {t('common.title', 'beneficiaries')}</span>
                      <span>🤝 {p.volunteersEnrolled} / {p.volunteersNeeded} {t('common.slots', 'vols')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('project_detail', p.id)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    {t('common.viewDetails', 'Inspect & Support Project')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Causes Taxonomy Explorer */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            <h2 style={{ fontSize: '1.875rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
              {t('home.causesTitle', 'Causes & Sustainable Goals')}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {t('home.causesSubtitle', 'Explore initiatives aligned with UN Sustainable Development Goals and MCA Schedule VII priority areas.')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {CAUSES_LIST.map(cause => {
              const causeNameLocalized = t(`causes.${cause.id}`, cause.name);
              return (
                <div
                  key={cause.id}
                  onClick={() => onNavigate('projects')}
                  className="card card-hover"
                  style={{ cursor: 'pointer', borderLeft: `4px solid ${cause.color}`, padding: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--secondary)' }}>{causeNameLocalized}</h4>
                    {cause.sdgNumber && (
                      <span style={{ fontSize: '0.6875rem', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        SDG #{cause.sdgNumber}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {cause.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
