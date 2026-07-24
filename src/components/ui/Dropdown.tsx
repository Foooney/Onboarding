import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../../lib/utils';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  destructive?: boolean;
  onSelect: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cx('relative inline-block', className)}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} aria-expanded={open}>
        {trigger}
      </button>
      {open && (
        <div
          className={cx(
            'absolute z-20 mt-2 min-w-[12rem] rounded-lg border border-surface-200 bg-white py-1 shadow-sm',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                item.onSelect();
                setOpen(false);
              }}
              className={cx(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm hover:bg-surface-50',
                item.destructive ? 'text-danger-700' : 'text-ink-700',
              )}
            >
              {item.icon && <item.icon size={16} strokeWidth={1.75} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
