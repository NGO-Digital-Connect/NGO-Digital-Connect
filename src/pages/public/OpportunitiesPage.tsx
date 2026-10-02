import React, { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import { COMMON_SKILLS, CAUSES_LIST } from '../../data/causes';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, applyForOpportunity, applications } = useData();
  const { currentUser, loginAsRole } = useAuth();
  const { t } = useTranslation();

  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [selectedCause, setSelectedCause] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredOpps = opportunities.filter(opp => {
    const matchesSkill = selectedSkill === 'ALL' || opp.skillsRequired.includes(selectedSkill);
    const matchesCause = selectedCause === 'ALL' || opp.cause === selectedCause;
    const matchesMode = selectedMode === 'ALL' || opp.location.mode === selectedMode;
    return matchesSkill && matchesCause && matchesMode;
  });

  const handleApply = async (oppId: string) => {
    if (currentUser.role !== 'VOLUNTEER') {
      const confirmSwitch = window.confirm(
        `You are currently logged in as "${currentUser.role}". Would you like to switch to the Volunteer persona (Arjun Mehta) to test applying?`
      );
      if (confirmSwitch) {
        loginAsRole('VOLUNTEER');
      }
      return;
    }

    const res = await applyForOpportunity(oppId);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
          {t('footer.opportunitiesLink', 'Volunteer Opportunities')}
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px' }}>
          {t('portals.volunteer.subtitle', 'Contribute your professional skills, join grassroots field drives, and track your verified community service hours.')}
        </p>
      </div>

      {feedbackMsg && (
        <div
          style={{
            background: feedbackMsg.type === 'success' ? 'var(--accent-light)' : 'var(--danger-light)',
            border: `1px solid ${feedbackMsg.type === 'success' ? 'var(--accent)' : 'var(--danger)'}`,
            color: feedbackMsg.type === 'success' ? 'var(--accent)' : 'var(--danger)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} aria-label={t('common.close', 'Close')}>
            <Icons.X size={18} />
          </button>
        </div>
      )}

      {/* Filter Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-card)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('common.category', 'Required Skill')}</label>
            <select
              className="form-select"
              value={selectedSkill}
              onChange={e => setSelectedSkill(e.target.value)}
            >
              <option value="ALL">{t('common.all', 'All Skills')}</option>
              {COMMON_SKILLS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('common.category', 'Cause')}</label>
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
            <label className="form-label">{t('common.location', 'Service Mode')}</label>
            <select
              className="form-select"
              value={selectedMode}
              onChange={e => setSelectedMode(e.target.value)}
            >
              <option value="ALL">{t('common.all', 'All Modes')}</option>
              <option value="ON_FIELD">On Field</option>
              <option value="REMOTE">Remote / Digital</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid-2">
        {filteredOpps.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)' }}>
            <Icons.Users size={48} color="var(--text-light)" />
            <h3 style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              {t('portals.volunteer.noOpportunities', 'No matching volunteering opportunities found at this time.')}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
              {t('common.clearFilters', 'Try clearing your skill or location filters.')}
            </p>
          </div>
        ) : (
          filteredOpps.map(opp => {
            const isFull = opp.slotsFilled >= opp.slotsTotal;
            const userHasApplied = applications.some(a => a.opportunityId === opp.id && a.volunteerId === currentUser.id);
            const causeLocalized = t(`causes.${opp.cause}`, opp.cause);

            return (
              <div key={opp.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {causeLocalized} • {opp.location.city}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem', color: 'var(--secondary)' }}>{opp.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t('common.organization', 'Organized by')} <strong>{opp.ngoName}</strong>
                    </div>
                  </div>

                  <span className={isFull ? 'badge badge-critical' : 'badge badge-verified'}>
                    {isFull ? t('status.full', 'Capacity Full') : `${opp.slotsFilled}/${opp.slotsTotal} ${t('common.slots', 'Slots')}`}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1rem', flex: 1 }}>
                  {opp.description}
                </p>

                {/* Details Bar */}
                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('common.date', 'Schedule & Duration')}:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{opp.date} ({opp.duration})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('common.location', 'Mode of Service')}:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{opp.location.mode}</strong>
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {opp.skillsRequired.map(s => (
                    <span key={s} className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleApply(opp.id)}
                  disabled={isFull || userHasApplied}
                  className={`btn ${isFull || userHasApplied ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%' }}
                >
                  {userHasApplied ? `✓ ${t('portals.volunteer.appliedBadge', 'Enrolled')}` : isFull ? t('status.full', 'No Slots Available (Full)') : t('portals.volunteer.applyBtn', 'Sign Up to Volunteer')}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
