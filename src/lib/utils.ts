export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatEnumLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// The domain palette (primary/ink/surface/success/warning/danger) intentionally
// has no room for 8 distinguishable people-avatar colors — this is the one
// deliberate, documented exception. See CLAUDE.md.
export const AVATAR_COLOR_CLASSES: Record<string, string> = {
  teal: 'bg-primary-100 text-primary-700',
  blue: 'bg-sky-100 text-sky-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  violet: 'bg-violet-100 text-violet-700',
  pink: 'bg-pink-100 text-pink-700',
  amber: 'bg-amber-100 text-amber-700',
  green: 'bg-emerald-100 text-emerald-700',
  slate: 'bg-slate-200 text-slate-700',
};

export function avatarColorClasses(color: string): string {
  return AVATAR_COLOR_CLASSES[color] ?? AVATAR_COLOR_CLASSES.slate;
}

// Shared button styling — not a dedicated component (not part of the ui/ kit
// this project scopes to), just consistent classes for native <button> tags.
const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-body-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none';

const BUTTON_VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-300',
  secondary: 'bg-white text-ink-700 border border-surface-200 hover:bg-surface-50 focus:ring-primary-200',
  ghost: 'text-ink-600 hover:bg-surface-100 focus:ring-primary-200',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 focus:ring-danger-200',
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string): string {
  return cx(BUTTON_BASE, BUTTON_VARIANTS[variant], className);
}

// Shared form control styling, reused by every filter/select/input across
// the app so wizard forms and table filters look identical.
export const INPUT_CLASSES =
  'w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-body text-ink-700 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100';

export const SELECT_CLASSES =
  'rounded-lg border border-surface-200 bg-white px-3 py-2 text-body-sm text-ink-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100';
