import { ChevronDown, ClipboardList, UserCog, UserRound } from 'lucide-react';
import type { ViewerRole } from '../../types';
import { useApp } from '../../lib/store';
import { Dropdown, type DropdownItem } from '../ui/Dropdown';

const ROLE_CONFIG: Record<ViewerRole, { label: string; icon: typeof UserCog }> = {
  manager: { label: 'Manager', icon: UserCog },
  new_joiner: { label: 'New Joiner', icon: UserRound },
  task_owner: { label: 'Task Owner', icon: ClipboardList },
};

export function RoleSwitcher() {
  const { viewerRole, setViewerRole } = useApp();
  const current = ROLE_CONFIG[viewerRole];

  const items: DropdownItem[] = (Object.keys(ROLE_CONFIG) as ViewerRole[]).map((role) => ({
    key: role,
    label: ROLE_CONFIG[role].label,
    icon: ROLE_CONFIG[role].icon,
    onSelect: () => setViewerRole(role),
  }));

  return (
    <Dropdown
      align="right"
      items={items}
      trigger={
        <span className="flex items-center gap-2 rounded-lg border border-surface-200 px-3 py-2 text-body-sm font-medium text-ink-700 hover:bg-surface-50">
          <current.icon size={16} strokeWidth={1.75} />
          {current.label}
          <ChevronDown size={14} strokeWidth={1.75} className="text-ink-400" />
        </span>
      }
    />
  );
}
