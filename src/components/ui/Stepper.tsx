import { Check } from 'lucide-react';
import { cx } from '../../lib/utils';

export interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol className={cx('flex items-center', className)}>
      {steps.map((step, index) => {
        const status = index < currentStep ? 'done' : index === currentStep ? 'current' : 'upcoming';
        return (
          <li key={step} className={cx('flex items-center', index < steps.length - 1 && 'flex-1')}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-semibold',
                  status === 'done' && 'bg-primary-600 text-white',
                  status === 'current' && 'bg-primary-50 text-primary-700 ring-2 ring-primary-500',
                  status === 'upcoming' && 'bg-surface-100 text-ink-400',
                )}
              >
                {status === 'done' ? <Check size={16} strokeWidth={2} /> : index + 1}
              </span>
              <span
                className={cx(
                  'whitespace-nowrap text-caption',
                  status === 'upcoming' ? 'text-ink-400' : 'text-ink-700',
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span className={cx('mx-2 h-px flex-1', status === 'done' ? 'bg-primary-500' : 'bg-surface-200')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
