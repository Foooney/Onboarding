import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cx } from '../../lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  content?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<TimelineItem['tone']>, string> = {
  default: 'bg-surface-100 text-ink-500',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cx('relative space-y-6 border-l border-surface-200 pl-6', className)}>
      {items.map((item) => {
        const Icon = item.icon ?? Check;
        const tone = item.tone ?? 'default';
        return (
          <li key={item.id} className="relative">
            <span
              className={cx(
                'absolute -left-[calc(1.5rem+9px)] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white',
                TONE_CLASSES[tone],
              )}
            >
              <Icon size={12} strokeWidth={2} />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-body font-medium text-ink-800">{item.title}</p>
              {item.meta && <span className="text-body-sm text-ink-400">{item.meta}</span>}
            </div>
            {item.description && <p className="mt-0.5 text-body-sm text-ink-500">{item.description}</p>}
            {item.content}
          </li>
        );
      })}
    </ol>
  );
}
