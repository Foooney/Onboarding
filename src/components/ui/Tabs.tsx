import { cx } from '../../lib/utils';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
  return (
    <div className={cx('flex items-center gap-1 border-b border-surface-200', className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cx(
              'relative flex items-center gap-1.5 px-3 py-2.5 text-body-sm font-medium transition-colors',
              active ? 'text-primary-700' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-caption',
                  active ? 'bg-primary-50 text-primary-700' : 'bg-surface-100 text-ink-500',
                )}
              >
                {tab.count}
              </span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary-600" />}
          </button>
        );
      })}
    </div>
  );
}
