import React, { useState } from 'react';
import { Icons } from '../common/Icons';
import { AiService } from '../../services/aiService';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';

interface NgoAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const NgoAssistantModal: React.FC<NgoAssistantModalProps> = ({ isOpen, onClose }) => {
  const { cases, projects, opportunities } = useData();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: t('ai.welcomeMsg', `Hello ${currentUser.profile.name}! I am your NGO Operations Intelligence Assistant. You can ask me to analyze unresolved cases, identify underfunded projects, check volunteer capacities, or summarize field milestones.`)
    }
]);
if (!isOpen) return null;
  const handleSend = (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q };
    const responseText = AiService.queryNgoAssistant(
      q,
      cases,
      projects,
      opportunities,
      currentUser.id
    );
    const botMsg = { sender: 'assistant' as const, text: responseText };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setQuery('');
  };

  const sampleQueries = [
    { key: 'ai.q1', defaultText: 'Show unresolved high-priority cases' },
    { key: 'ai.q2', defaultText: 'Which projects are underfunded?' },
    { key: 'ai.q3', defaultText: 'What is our volunteer slot capacity?' },
    { key: 'ai.q4', defaultText: 'Show upcoming project milestones' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade" style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}>
        {/* Modal Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Icons.Sparkles size={22} color="#38bdf8" />
            <div>
              <h3 style={{ color: '#ffffff', fontSize: '1.125rem' }}>{t('ai.copilotTitle', 'NGO Operations Copilot')}</h3>
              <p style={{ fontSize: '0.75rem', color: '#bfdbfe' }}>{t('ai.copilotSubtitle', 'Grounded in live database state & assigned case files')}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }} aria-label={t('common.close', 'Close')}>
            <Icons.X size={20} />
          </button>
        </div>

        {/* Chat Thread */}
        <div style={{ height: '360px', overflowY: 'auto', padding: '1.25rem', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-sm)',
                border: m.sender === 'assistant' ? '1px solid var(--border)' : 'none',
                lineHeight: '1.5'
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {sampleQueries.map((sq, i) => {
            const queryLabel = t(sq.key, sq.defaultText);
            return (
              <button
                key={i}
                onClick={() => handleSend(queryLabel)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap' }}
              >
                {queryLabel}
              </button>
            );
          })}
        </div>

        {/* Query Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
        >
          <input
            type="text"
            className="form-input"
            placeholder={t('ai.placeholder', 'Ask about cases, funding gaps, volunteer slots...')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ margin: 0 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }} aria-label={t('portals.beneficiary.sendBtn', 'Send')}>
            <Icons.Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
