import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../lib/utils';

export interface FilterBarProps {
  children: ReactNode;
  activeFilterCount?: number;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({ children, activeFilterCount = 0, onClearAll, className }: FilterBarProps) {
  return (
    <div className={cx('flex flex-wrap items-center gap-3', className)}>
      {children}
      {activeFilterCount > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 text-body-sm text-ink-500 hover:text-ink-700"
        >
          <X size={14} strokeWidth={1.75} />
          Clear filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
