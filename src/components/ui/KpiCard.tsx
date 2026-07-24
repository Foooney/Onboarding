import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Card } from './Card';
import { cx } from '../../lib/utils';

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  trend?: { label: string; direction: 'up' | 'down' | 'flat' };
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const TONE_ICON_CLASSES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

const TREND_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus };
const TREND_CLASSES = { up: 'text-success-700', down: 'text-danger-700', flat: 'text-ink-400' };

export function KpiCard({ label, value, icon: Icon, hint, trend, tone = 'default' }: KpiCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-caption uppercase tracking-wide text-ink-400">{label}</p>
          <p className="mt-2 text-display text-ink-800">{value}</p>
        </div>
        {Icon && (
          <div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TONE_ICON_CLASSES[tone])}>
            <Icon size={20} strokeWidth={1.75} />
          </div>
        )}
      </div>
      {(trend || hint) && (
        <div className="mt-3 flex items-center gap-1.5 text-body-sm text-ink-500">
          {TrendIcon && trend && (
            <span className={cx('flex items-center gap-0.5', TREND_CLASSES[trend.direction])}>
              <TrendIcon size={14} strokeWidth={2} />
              {trend.label}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </Card>
  );
}
