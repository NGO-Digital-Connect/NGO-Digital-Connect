import React from 'react';

interface MetricProgressProps {
  label: string;
  current: number;
  target: number;
  unitPrefix?: string;
  unitSuffix?: string;
  color?: string;
}

export const MetricProgressBar: React.FC<MetricProgressProps> = ({
  label,
  current,
  target,
  unitPrefix = '',
  unitSuffix = '',
  color = 'var(--primary)'
}) => {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)' }}>
          {unitPrefix}{current.toLocaleString('en-IN')}{unitSuffix} / {unitPrefix}{target.toLocaleString('en-IN')}{unitSuffix} ({percentage}%)
        </span>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
