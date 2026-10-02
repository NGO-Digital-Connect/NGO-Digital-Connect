import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import { STATES_AND_CITIES } from '../../data/causes';
import type { UserRole, UserProfile } from '../../types/models';

export const RegisterPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { t } = useTranslation();

  const [selectedRole, setSelectedRole] = useState<UserRole>('BENEFICIARY');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [state, setState] = useState('West Bengal');

  // Role specific state
  const [orgName, setOrgName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [selectedCauses] = useState<string[]>(['healthcare']);
  const [selectedSkills] = useState<string[]>(['First Aid & Triage']);
  const [volunteerAvailability] = useState<'WEEKDAYS' | 'WEEKENDS' | 'FLEXIBLE'>('WEEKENDS');
  const [annualCsrBudget, setAnnualCsrBudget] = useState(2500000);
  const [govDept, setGovDept] = useState('');

  // Status & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleDefinitions: { role: UserRole; translationKey: string; defaultTitle: string; subtitle: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
    {
      role: 'BENEFICIARY',
      translationKey: 'roles.beneficiary',
      defaultTitle: 'Beneficiary',
      subtitle: 'I need medical, educational, food, or crisis assistance for myself or family.',
      icon: Icons.Heart
    },
    {
      role: 'NGO',
      translationKey: 'roles.ngo',
      defaultTitle: 'Non-Profit (NGO)',
      subtitle: 'We are a registered society or trust executing field projects and relief.',
      icon: Icons.Building
    },
    {
      role: 'VOLUNTEER',
      translationKey: 'roles.volunteer',
      defaultTitle: 'Volunteer',
      subtitle: 'I want to contribute my time, professional skills, or weekend mentorship.',
      icon: Icons.HandHeart
    },
    {
      role: 'DONOR',
      translationKey: 'roles.donor',
      defaultTitle: 'Philanthropic Donor',
      subtitle: 'I want to fund social projects with 100% auditable utilization & 80G tax benefits.',
      icon: Icons.IndianRupee
    },
    {
      role: 'CSR',
      translationKey: 'roles.csr',
      defaultTitle: 'CSR Organization',
      subtitle: 'We deploy corporate capital aligned with MCA Schedule VII obligations.',
      icon: Icons.Target
    },
    {
      role: 'GOVERNMENT',
      translationKey: 'roles.government',
      defaultTitle: 'Government / Institution',
      subtitle: 'We monitor public social initiatives, welfare reach, and coordinate disaster response.',
      icon: Icons.Shield
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !fullName || !password) {
      setErrorMessage(t('common.error', 'Please fill in all mandatory fields.'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStage('Creating user account with Supabase Auth...');

    try {
      const profile: UserProfile = {
        name: fullName,
        phone,
        city,
        state,
        country: 'India',
        organizationName: orgName || undefined
      };

      if (selectedRole === 'NGO') {
        profile.ngoDetails = {
          ngoId: crypto.randomUUID(),
          registrationNumber: regNo || `WB/${new Date().getFullYear()}/PROV-001`,
          foundedYear: new Date().getFullYear(),
          mission: 'Dedicated to community empowerment and rapid emergency relief.',
          causes: selectedCauses,
          serviceAreas: [city],
          taxExemption80G: true,
          verificationStatus: 'PENDING',
          totalBeneficiariesServed: 0,
          activeProjectCount: 0
        };
      } else if (selectedRole === 'VOLUNTEER') {
        profile.volunteerDetails = {
          skills: selectedSkills,
          causes: selectedCauses,
          availability: volunteerAvailability,
          hoursLogged: 0
        };
      } else if (selectedRole === 'CSR') {
        profile.csrDetails = {
          companyName: orgName || 'Corporate Entity',
          annualBudget: annualCsrBudget,
          focusStates: [state],
          preferredCauses: selectedCauses,
          grantsCommitted: 0
        };
      } else if (selectedRole === 'GOVERNMENT') {
        profile.governmentDetails = {
          department: govDept || 'District Welfare Office',
          officialJurisdiction: `${city} Unit`,
          designation: 'Nodal Officer',
          authorizedIdNumber: `GOV-${Date.now().toString().slice(-4)}`
        };
      }

      setSubmitStage('Provisioning role workspace in PostgreSQL...');
      await register(selectedRole, email, password, profile);

      setSubmitStage('Redirecting to your dashboard...');

      // Route to appropriate portal
      switch (selectedRole) {
        case 'BENEFICIARY': onNavigate('portal_beneficiary'); break;
        case 'NGO': onNavigate('portal_ngo'); break;
        case 'VOLUNTEER': onNavigate('portal_volunteer'); break;
        case 'DONOR': onNavigate('portal_donor'); break;
        case 'CSR': onNavigate('portal_csr'); break;
        case 'GOVERNMENT': onNavigate('portal_government'); break;
        default: onNavigate('home');
      }
    } catch (err: any) {
      console.error('[RegisterPage] Registration failed:', err);
      setErrorMessage(err.message || 'Registration could not be completed. Please check your network and credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: '3rem 1.5rem', maxWidth: '860px' }}>
      <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
            {t('auth.registerTitle', 'Join the Connected Ecosystem')}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {t('auth.registerSubtitle', 'Create a verified account to submit help requests, coordinate field relief, volunteer, or fund impactful causes.')}
          </p>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.ShieldAlert size={20} color="var(--danger)" />
            <div>
              <strong>{t('common.error', 'Error')}: </strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* "Who are you?" Role Selection Cards */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label className="form-label" style={{ fontSize: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            {t('auth.selectRole', 'Who are you? (Select your stakeholder role)')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {roleDefinitions.map(r => {
              const IconComp = r.icon;
              const isSelected = selectedRole === r.role;
              const titleText = t(r.translationKey, r.defaultTitle);

              return (
                <div
                  key={r.role}
                  onClick={() => !isSubmitting && setSelectedRole(r.role)}
                  className="card"
                  style={{
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    borderWidth: isSelected ? '2px' : '1px',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    padding: '1.25rem',
                    transition: 'all 0.15s ease',
                    opacity: isSubmitting && !isSelected ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: isSelected ? 'var(--primary)' : 'var(--bg-subtle)', color: isSelected ? '#fff' : 'var(--text-main)', padding: '0.4rem', borderRadius: '8px' }}>
                      <IconComp size={20} />
                    </div>
                    <strong style={{ fontSize: '1rem', color: isSelected ? 'var(--primary)' : 'var(--secondary)' }}>
                      {titleText}
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {r.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Registration Form */}
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--secondary)' }}>
            {t('roles.' + selectedRole.toLowerCase(), selectedRole)} {t('auth.stepDetails', 'Credentials & Details')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('auth.fullName', 'Full Name / Contact Person')} *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Debabrata Roy"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.emailLabel', 'Email Address')} *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. debabrata@example.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.passwordLabel', 'Password (min. 6 chars)')} *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('common.confirm', 'Confirm')} {t('auth.passwordLabel', 'Password')} *</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.phone', 'Phone Number')}</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98300 00000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.state', 'State')}</label>
              <select
                className="form-select"
                value={state}
                disabled={isSubmitting}
                onChange={e => {
                  setState(e.target.value);
                  setCity(STATES_AND_CITIES[e.target.value]?.[0] || '');
                }}
              >
                {Object.keys(STATES_AND_CITIES).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.city', 'City / District')}</label>
              <select
                className="form-select"
                value={city}
                disabled={isSubmitting}
                onChange={e => setCity(e.target.value)}
              >
                {(STATES_AND_CITIES[state] || []).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role specific inputs */}
          {selectedRole === 'NGO' && (
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                NGO Statutory Verification Info
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('auth.organizationName', 'Registered Organization Name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Disha Social Welfare Trust"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('auth.regNumber', 'Society / Trust Registration No')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. WB/2018/009182"
                    value={regNo}
                    onChange={e => setRegNo(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'CSR' && (
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                {t('portals.csr.title', 'Corporate Social Responsibility Profile')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('portals.csr.companyName', 'Company Name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Infosys Foundation"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{t('portals.csr.annualBudget', 'Annual CSR Grant Allocation (INR)')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={annualCsrBudget}
                    onChange={e => setAnnualCsrBudget(parseFloat(e.target.value))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole === 'GOVERNMENT' && (
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                Institutional Agency Info
              </h4>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{t('auth.department', 'Department / Ministry Office')} *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Department of Women & Child Development"
                  value={govDept}
                  onChange={e => setGovDept(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>{submitStage || t('auth.creatingAccount', 'Creating account...')}</span>
              </>
            ) : (
              <span>{t('auth.createAccountBtn', 'Complete Registration')}</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {t('auth.alreadyAccount', 'Already have an account?')}{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {t('auth.loginHere', 'Sign In with Email')}
          </button>
        </div>
      </div>
    </div>
  );
};
