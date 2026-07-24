import { Avatar } from './Avatar';
import { cx } from '../../lib/utils';

export interface AvatarGroupPerson {
  firstName: string;
  lastName: string;
  color: string;
}

export interface AvatarGroupProps {
  people: AvatarGroupPerson[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function AvatarGroup({ people, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  return (
    <div className={cx('flex -space-x-2', className)}>
      {visible.map((person, index) => (
        <Avatar
          key={`${person.firstName}-${person.lastName}-${index}`}
          firstName={person.firstName}
          lastName={person.lastName}
          color={person.color}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cx(
            'inline-flex shrink-0 items-center justify-center rounded-full bg-ink-100 font-semibold text-ink-600 ring-2 ring-white',
            size === 'sm' ? 'h-6 w-6 text-caption' : 'h-9 w-9 text-body-sm',
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
