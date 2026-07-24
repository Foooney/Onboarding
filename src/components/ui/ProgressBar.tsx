import { cx } from '../../lib/utils';

export interface ProgressBarProps {
  value: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

const SIZE_CLASSES: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export function ProgressBar({ value, tone = 'primary', size = 'md', showLabel = false, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <div className={cx('flex-1 overflow-hidden rounded-full bg-surface-100', SIZE_CLASSES[size])}>
        <div
          className={cx('h-full rounded-full transition-[width]', TONE_CLASSES[tone])}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && <span className="text-body-sm font-medium text-ink-600">{clamped}%</span>}
    </div>
  );
}
