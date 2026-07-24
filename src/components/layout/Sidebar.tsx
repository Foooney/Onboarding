import { NavLink } from 'react-router-dom';
import { BarChart3, IdCard, LayoutDashboard, LayoutTemplate, ListChecks, Route, Waypoints } from 'lucide-react';
import { cx } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/journeys', label: 'Onboarding Journeys', icon: Route },
  { to: '/library', label: 'Task Library', icon: ListChecks },
  { to: '/pass', label: 'My Onboarding Pass', icon: IdCard },
  { to: '/my-tasks', label: 'My Assigned Tasks', icon: Waypoints },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-surface-200 bg-surface-50">
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-body-sm font-bold text-white">
          SI
        </span>
        <span className="text-body font-semibold text-ink-800">Onboarding Hub</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-600 hover:bg-surface-100 hover:text-ink-800',
              )
            }
          >
            <item.icon size={18} strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 text-caption text-ink-400">SI Onboarding Hub — demo build</div>
    </aside>
  );
}
