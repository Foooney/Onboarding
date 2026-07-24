import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md';
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
};

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cx('rounded-xl border border-surface-200 bg-white shadow-sm', PADDING[padding], className)}>
      {children}
    </div>
  );
}
