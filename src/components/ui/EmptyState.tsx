import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { buttonClasses, cx } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx('flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-200 px-6 py-16 text-center', className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-ink-400">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-h3 text-ink-700">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-body-sm text-ink-500">{description}</p>}
      {action && (
        <button type="button" onClick={action.onClick} className={cx(buttonClasses('primary'), 'mt-5')}>
          {action.label}
        </button>
      )}
    </div>
  );
}
