import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from '../../components/common/Icons';
import type { UserRole } from '../../types/models';

export const LoginPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { login, loginAsRole } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const demoAccounts: { role: UserRole; name: string; email: string; label: string; org?: string }[] = [
    { role: 'BENEFICIARY', name: 'Rajesh Mondal', email: 'rajesh.mondal@example.com', label: 'Beneficiary (Seeking Medical Help)' },
    { role: 'NGO', name: 'Dr. Ananya Sen', email: 'contact@preronamission.org', label: 'NGO Director (Prerona Mission)' },
    { role: 'VOLUNTEER', name: 'Arjun Mehta', email: 'arjun.mehta@example.com', label: 'Field Volunteer (STEM & Triage)' },
    { role: 'DONOR', name: 'Kavita Deshmukh', email: 'kavita.deshmukh@example.com', label: 'Individual Philanthropist' },
    { role: 'CSR', name: 'Vikramaditya Oberoi', email: 'csr@tatanetworks.com', label: 'CSR Investments Lead' },
    { role: 'GOVERNMENT', name: 'Debashis Mukherjee, IAS', email: 'dm.kolkata@wb.gov.in', label: 'Gov Welfare Nodal Officer' },
    { role: 'ADMIN', name: 'Platform Oversight', email: 'admin@ngodigitalconnect.org', label: 'Platform Trust Administrator' }
  ];

  const getPortalView = (role: UserRole) => {
    switch (role) {
      case 'BENEFICIARY': return 'portal_beneficiary';
      case 'NGO': return 'portal_ngo';
      case 'VOLUNTEER': return 'portal_volunteer';
      case 'DONOR': return 'portal_donor';
      case 'CSR': return 'portal_csr';
      case 'GOVERNMENT': return 'portal_government';
      case 'ADMIN': return 'portal_admin';
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setIsLoggingIn(true);

    try {
      const loggedUser = await login(email, password || undefined);
      if (loggedUser) {
        onNavigate(getPortalView(loggedUser.role));
      }
    } catch (err: any) {
      console.error('[LoginPage] Login error:', err);
      setError(err.message || `No account found for email: ${email}. Please check your credentials.`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: '3.5rem 1.5rem', maxWidth: '800px' }}>
      <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)', marginBottom: '0.75rem' }}>
            <Icons.Lock size={28} />
          </div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--secondary)' }}>
            {t('auth.signInTitle', 'Sign In to NGO Digital Connect')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {t('auth.signInSubtitle', 'Select any pre-configured demo account below for instant 1-click role testing, or enter your Supabase Auth credentials.')}
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.ShieldAlert size={18} color="var(--danger)" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts Grid */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ marginBottom: '0.75rem' }}>
            {t('auth.instantLogins', 'Instant 1-Click Role Logins')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                onClick={async () => {
                  await loginAsRole(acc.role);
                  onNavigate(getPortalView(acc.role));
                }}
                className="btn btn-secondary"
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.75rem',
                  height: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--secondary)' }}>
                    {t('roles.' + acc.role.toLowerCase(), acc.role)}
                  </strong>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {t('auth.clickToLogin', 'Click to Login')}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>{acc.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{acc.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-light)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ padding: '0 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {t('auth.orEnterCreds', 'Or sign in with email credentials')}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleCustomLogin}>
          <div className="form-group">
            <label className="form-label">{t('auth.emailLabel', 'Email Address')}</label>
            <input
              type="email"
              className="form-input"
              placeholder={t('auth.emailPlaceholder', 'you@example.com')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoggingIn}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.passwordLabel', 'Password')}</label>
            <input
              type="password"
              className="form-input"
              placeholder={t('auth.passwordPlaceholder', '••••••••')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoggingIn}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>{t('auth.signingIn', 'Signing in...')}</span>
              </>
            ) : (
              <span>{t('auth.signInBtn', 'Sign In')}</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {t('auth.registerHere', 'Register here')}
          </button>
        </div>
      </div>
    </div>
  );
};
