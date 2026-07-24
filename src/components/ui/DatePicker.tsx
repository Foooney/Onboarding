import { cx } from '../../lib/utils';

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  min?: string;
  max?: string;
  className?: string;
}

export function DatePicker({ value, onChange, label, min, max, className }: DatePickerProps) {
  return (
    <label className={cx('flex flex-col gap-1', className)}>
      {label && <span className="text-label text-ink-600">{label}</span>}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-body text-ink-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
      />
    </label>
  );
}
