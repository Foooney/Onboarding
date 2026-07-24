import type { JourneyStatus, Priority, TaskStatus } from '../../types';
import { cx } from '../../lib/utils';

export interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-surface-100 text-ink-600',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

export function Badge({ label, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; tone: BadgeProps['tone'] }> = {
  not_started: { label: 'Not started', tone: 'neutral' },
  planned: { label: 'Planned', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'primary' },
  completed: { label: 'Completed', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'danger' },
  blocked: { label: 'Blocked', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return <Badge label={config.label} tone={config.tone} className={className} />;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; tone: BadgeProps['tone'] }> = {
  low: { label: 'Low', tone: 'neutral' },
  medium: { label: 'Medium', tone: 'primary' },
  high: { label: 'High', tone: 'warning' },
  critical: { label: 'Critical', tone: 'danger' },
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const config = PRIORITY_CONFIG[priority];
  return <Badge label={config.label} tone={config.tone} className={className} />;
}

const JOURNEY_STATUS_CONFIG: Record<JourneyStatus, { label: string; tone: BadgeProps['tone'] }> = {
  not_started: { label: 'Not started', tone: 'neutral' },
  on_track: { label: 'On track', tone: 'success' },
  at_risk: { label: 'At risk', tone: 'warning' },
  on_hold: { label: 'On hold', tone: 'danger' },
  completed: { label: 'Completed', tone: 'primary' },
};

export function JourneyStatusBadge({ status, className }: { status: JourneyStatus; className?: string }) {
  const config = JOURNEY_STATUS_CONFIG[status];
  return <Badge label={config.label} tone={config.tone} className={className} />;
}
