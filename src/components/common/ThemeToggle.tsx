import React from 'react';
import { useTheme } from '../../store/ThemeContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Icons } from './Icons';

export const ThemeToggle: React.FC<{ className?: string; compact?: boolean }> = ({ className = '', compact = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-secondary ${compact ? 'btn-sm' : ''} ${className}`}
      title={label}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: compact ? '0.35rem 0.6rem' : '0.45rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        color: isDark ? '#fbbf24' : '#0284c7',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: compact ? '36px' : 'auto',
        height: '36px',
      }}
    >
      {isDark ? (
        <Icons.Sun size={17} color="#fbbf24" />
      ) : (
        <Icons.Moon size={17} color="#0284c7" />
      )}
      {!compact && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {isDark ? '☀️ ' + t('nav.themeToggle', 'Light') : '🌙 ' + t('nav.themeToggle', 'Dark')}
        </span>
      )}
    </button>
  );
};
