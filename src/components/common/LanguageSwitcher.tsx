import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import type { Language } from '../../i18n/types';
import { Icons } from './Icons';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage, supportedLanguages, currentLanguageOption, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('nav.language', 'Language')}: ${currentLanguageOption.name}`}
        title={`${t('nav.language', 'Language')}: ${currentLanguageOption.nativeName}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: compact ? '0.35rem 0.5rem' : '0.45rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
          color: 'var(--text-main)',
          height: '36px',
          fontSize: '0.8125rem',
          fontWeight: 600,
        }}
      >
        <Icons.Globe size={16} color="var(--primary)" />
        <span style={{ fontWeight: 700 }}>
          {currentLanguageOption.nativeName}
        </span>
        <Icons.ChevronDown size={14} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t('nav.language', 'Select Language')}
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: '180px',
            zIndex: 100,
            padding: '0.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('nav.language', 'Select Language')}
          </div>
          {supportedLanguages.map(lang => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '0.875rem', lineHeight: '1.2' }}>{lang.nativeName}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{lang.name}</span>
                </div>
                {isSelected && <Icons.Check size={16} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
