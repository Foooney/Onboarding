import { avatarColorClasses, cx, getInitials } from '../../lib/utils';

export interface AvatarProps {
  firstName: string;
  lastName: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-6 w-6 text-caption',
  md: 'h-9 w-9 text-body-sm',
  lg: 'h-12 w-12 text-body-lg',
  xl: 'h-16 w-16 text-h2',
};

export function Avatar({ firstName, lastName, color, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE_CLASSES[size],
        avatarColorClasses(color),
        className,
      )}
      title={`${firstName} ${lastName}`}
    >
      {getInitials(firstName, lastName)}
    </span>
  );
}
