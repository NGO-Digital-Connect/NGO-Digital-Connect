import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useData } from '../../store/DataContext';
import { useSubscription } from '../../store/SubscriptionContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from './Icons';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import type { UserRole } from '../../types/models';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { currentUser, loginAsRole, isSupabaseConnected } = useAuth();
  const { notifications, markNotificationRead, isSyncing } = useData();
  const { currentPlan } = useSubscription();
  const { t } = useTranslation();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const userNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  const roles: { role: UserRole; translationKey: string; color: string }[] = [
    { role: 'BENEFICIARY', translationKey: 'roles.beneficiary', color: '#0284c7' },
    { role: 'NGO', translationKey: 'roles.ngo', color: '#16a34a' },
    { role: 'VOLUNTEER', translationKey: 'roles.volunteer', color: '#7c3aed' },
    { role: 'DONOR', translationKey: 'roles.donor', color: '#ea580c' },
    { role: 'CSR', translationKey: 'roles.csr', color: '#0d9488' },
    { role: 'GOVERNMENT', translationKey: 'roles.government', color: '#475569' },
    { role: 'ADMIN', translationKey: 'roles.admin', color: '#dc2626' }
  ];

  const getPortalViewForRole = (role: UserRole) => {
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

  const navItems = [
    { id: 'home', labelKey: 'nav.home' },
    { id: 'ngos', labelKey: 'nav.ngos' },
    { id: 'projects', labelKey: 'nav.projects' },
    { id: 'opportunities', labelKey: 'nav.opportunities' },
    { id: 'impact', labelKey: 'nav.impact' },
    { id: 'pricing', labelKey: 'nav.pricing' },
  ];

  return (
    <header style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Top Demo Persona & Database Status Bar */}
      <div style={{ background: 'var(--top-bar-bg)', color: '#e2e8f0', fontSize: '0.75rem', padding: '0.35rem 1rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{t('nav.demoPersonaSwitcher', 'Demo Persona Switcher:')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSupabaseConnected ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
              <span style={{ color: isSupabaseConnected ? '#86efac' : '#fde047', fontSize: '0.6875rem', fontWeight: 600 }}>
                {isSupabaseConnected ? t('nav.supabaseDb', 'Supabase PostgreSQL') : t('nav.localDb', 'Local Persistence')}
              </span>
              {isSyncing && <span style={{ color: '#38bdf8', fontSize: '0.6875rem' }}>• {t('nav.syncing', 'Syncing...')}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => {
                  loginAsRole(r.role);
                  onNavigate(getPortalViewForRole(r.role));
                }}
                className="btn"
                style={{
                  background: currentUser.role === r.role ? r.color : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  fontWeight: currentUser.role === r.role ? 700 : 500,
                  fontSize: '0.7rem',
                  lineHeight: '1.2'
                }}
              >
                {t(r.translationKey, r.role)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1.5rem', gap: '1rem' }}>
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{ background: 'var(--primary)', color: '#ffffff', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Heart size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--secondary)', display: 'block', lineHeight: 1.15 }}>
              NGO DIGITAL CONNECT
            </span>
            <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ecosystem Platform
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: currentView === item.id ? 700 : 500,
                color: currentView === item.id ? 'var(--primary)' : 'var(--text-main)',
                fontSize: '0.875rem',
                padding: '0.35rem 0.2rem',
                borderBottom: currentView === item.id ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'color 0.15s ease'
              }}
            >
              {t(item.labelKey, item.id)}
            </button>
          ))}
        </nav>

        {/* Right Controls: Language, Theme, Notifications, Portal CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {/* Multilingual Selector */}
          <LanguageSwitcher compact />

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle compact />

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)',
                position: 'relative',
                display: 'flex',
                height: '36px',
                width: '36px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={t('nav.notifications', 'Notifications')}
              aria-label={t('nav.notifications', 'Notifications')}
            >
              <Icons.ShieldAlert size={18} color="var(--text-main)" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '2.5rem',
                width: '320px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.75rem',
                zIndex: 100
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {t('nav.notifications', 'Notifications')} ({unreadCount} {t('nav.notificationsNew', 'new')})
                  </span>
                  <button onClick={() => setShowNotifMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Icons.X size={16} />
                  </button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {userNotifs.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                      {t('nav.noNotifications', 'No notifications')}
                    </p>
                  ) : (
                    userNotifs.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          background: n.isRead ? 'var(--bg-card)' : 'var(--primary-light)',
                          marginBottom: '0.35rem',
                          cursor: 'pointer',
                          borderLeft: `3px solid ${n.type === 'ALERT' ? 'var(--danger)' : 'var(--primary)'}`
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-main)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-light)', marginTop: '2px' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Portal CTA */}
          <button
            onClick={() => onNavigate(getPortalViewForRole(currentUser.role))}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', height: '36px', padding: '0 0.85rem' }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>
              {t('roles.' + currentUser.role.toLowerCase(), currentUser.role)} {t('roles.portalName', 'Portal')}
            </span>
            <Icons.ArrowRight size={15} />
          </button>

          {/* Subscription Tier Badge */}
          <button
            onClick={() => onNavigate('pricing')}
            className="btn btn-secondary btn-sm"
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderColor: currentPlan === 'enterprise' ? '#10b981' : currentPlan === 'pro' ? '#38bdf8' : 'var(--border)',
              background: currentPlan === 'enterprise' ? 'rgba(16, 185, 129, 0.12)' : currentPlan === 'pro' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: currentPlan === 'enterprise' ? '#059669' : currentPlan === 'pro' ? '#0284c7' : 'var(--text-secondary)',
              fontWeight: 700,
            }}
            title="Subscription & Plans"
          >
            <Icons.Sparkles size={14} color="currentColor" />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {currentPlan}
            </span>
          </button>

          {/* Quick Register / Logout */}
          <button
            onClick={() => onNavigate('register')}
            className="btn btn-secondary btn-sm"
            style={{ height: '36px', whiteSpace: 'nowrap' }}
          >
            {t('nav.switchRole', 'Switch/Register')}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="btn btn-secondary mobile-menu-btn"
            aria-label={showMobileMenu ? t('nav.closeMenu', 'Close Menu') : t('nav.openMenu', 'Open Menu')}
            style={{ padding: '0.45rem', height: '36px', width: '36px', display: 'none' }}
          >
            {showMobileMenu ? <Icons.X size={18} /> : <Icons.Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMobileMenu && (
        <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="mobile-drawer">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setShowMobileMenu(false);
              }}
              style={{
                background: currentView === item.id ? 'var(--primary-light)' : 'transparent',
                color: currentView === item.id ? 'var(--primary)' : 'var(--text-main)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.625rem 0.75rem',
                textAlign: 'left',
                fontWeight: currentView === item.id ? 700 : 500,
                fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              {t(item.labelKey, item.id)}
            </button>
          ))}
        </div>
      )}

      {/* Responsive CSS for Header */}
      <style>{`
        @media (max-width: 960px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};
