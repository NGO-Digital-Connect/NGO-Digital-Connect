import React from 'react';
import type { CaseUrgency } from '../../types/models';
import { useTranslation } from '../../i18n/LanguageContext';

interface UrgencyBadgeProps {
  urgency: CaseUrgency;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency }) => {
  const { t } = useTranslation();

  const map: Record<CaseUrgency, { labelKey: string; defaultLabel: string; className: string }> = {
    CRITICAL: { labelKey: 'urgency.critical', defaultLabel: 'Critical Urgency', className: 'badge badge-critical' },
    HIGH: { labelKey: 'urgency.high', defaultLabel: 'High Priority', className: 'badge badge-high' },
    MEDIUM: { labelKey: 'urgency.medium', defaultLabel: 'Medium Priority', className: 'badge badge-medium' },
    LOW: { labelKey: 'urgency.low', defaultLabel: 'Normal Urgency', className: 'badge badge-low' }
  };

  const item = map[urgency] || map.MEDIUM;
  return <span className={item.className}>{t(item.labelKey, item.defaultLabel)}</span>;
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();
  let className: string;

  const upper = (status || '').toUpperCase();
  const rawLabel = upper.replace(/_/g, ' ');
  const statusKey = `status.${upper.toLowerCase()}`;

  switch (upper) {
    case 'VERIFIED':
    case 'COMPLETED':
    case 'RESOLVED':
    case 'ACCEPTED':
      className = 'badge badge-verified';
      break;
    case 'IN_PROGRESS':
    case 'ACTIVE':
    case 'OPEN':
    case 'INVESTIGATING':
      className = 'badge badge-active';
      break;
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'PENDING':
    case 'PENDING_VERIFICATION':
    case 'MATCHED':
    case 'UNVERIFIED':
      className = 'badge badge-pending';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'SUSPENDED':
    case 'DISMISSED':
    case 'FULL':
      className = 'badge badge-critical';
      break;
    case 'ON_HOLD':
    case 'PAUSED':
      className = 'badge badge-high';
      break;
    default:
      className = 'badge badge-low';
  }

  return <span className={className}>{t(statusKey, rawLabel)}</span>;
};
