import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListChecks, Plus, ExternalLink, RotateCcw, LayoutTemplate } from 'lucide-react';
import { useApp } from '../../lib/store';
import { useToast } from '../ui/Toast';
import { SearchInput } from '../ui/SearchInput';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Avatar } from '../ui/Avatar';
import { RoleSwitcher } from './RoleSwitcher';
import { buttonClasses, cx } from '../../lib/utils';

export function Topbar() {
  const { currentUser, resetDemoData, journeys, taskLibrary, templates } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = search.trim().toLowerCase();
  const open = query.length > 0;

  const journeyResults = open
    ? journeys
        .filter(
          (j) =>
            `${j.employee.firstName} ${j.employee.lastName}`.toLowerCase().includes(query) ||
            j.position.toLowerCase().includes(query) ||
            j.team.toLowerCase().includes(query),
        )
        .slice(0, 4)
    : [];
  const taskResults = open ? taskLibrary.filter((t) => !t.archived && t.title.toLowerCase().includes(query)).slice(0, 4) : [];
  const templateResults = open ? templates.filter((t) => t.name.toLowerCase().includes(query)).slice(0, 3) : [];
  const hasResults = journeyResults.length + taskResults.length + templateResults.length > 0;

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setSearch('');
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSearch('');
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function goToJourney(id: string) {
    navigate(`/journeys/${id}`);
    setSearch('');
  }

  function goToLibrary() {
    navigate('/library', { state: { initialSearch: search } });
    setSearch('');
  }

  function goToTemplates() {
    navigate('/templates');
    setSearch('');
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-surface-200 bg-white px-6">
      <div ref={containerRef} className="relative w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Search people, tasks, journeys…" />
        {open && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border border-surface-200 bg-white py-2 shadow-sm">
            {!hasResults && <p className="px-4 py-3 text-body-sm text-ink-400">No matches for "{search}".</p>}

            {journeyResults.length > 0 && (
              <SearchGroup label="Journeys">
                {journeyResults.map((j) => (
                  <SearchResult
                    key={j.id}
                    icon={<Avatar firstName={j.employee.firstName} lastName={j.employee.lastName} color={j.employee.avatarColor} size="sm" />}
                    label={`${j.employee.firstName} ${j.employee.lastName}`}
                    meta={`${j.position} · ${j.team}`}
                    onClick={() => goToJourney(j.id)}
                  />
                ))}
              </SearchGroup>
            )}

            {taskResults.length > 0 && (
              <SearchGroup label="Task library">
                {taskResults.map((t) => (
                  <SearchResult key={t.id} icon={<ListChecks size={16} strokeWidth={1.75} className="text-ink-400" />} label={t.title} meta={t.category.replace('_', ' ')} onClick={goToLibrary} />
                ))}
              </SearchGroup>
            )}

            {templateResults.length > 0 && (
              <SearchGroup label="Templates">
                {templateResults.map((t) => (
                  <SearchResult key={t.id} icon={<LayoutTemplate size={16} strokeWidth={1.75} className="text-ink-400" />} label={t.name} meta={`${t.team}`} onClick={goToTemplates} />
                ))}
              </SearchGroup>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link to="/journeys/new" className={buttonClasses('primary')}>
          <Plus size={16} strokeWidth={2} />
          New onboarding
        </Link>

        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          title="Reset demo data"
          aria-label="Reset demo data"
          className={buttonClasses('ghost', 'px-2.5')}
        >
          <RotateCcw size={16} strokeWidth={1.75} />
        </button>

        <RoleSwitcher />

        <Avatar firstName={currentUser.firstName} lastName={currentUser.lastName} color={currentUser.avatarColor} />
      </div>

      <ConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          showToast('Demo data has been reset.', 'info');
        }}
        title="Reset demo data?"
        description="This restores every journey, template and task to its original seed state. Any changes you made in this session will be lost."
        confirmLabel="Reset data"
        tone="danger"
      />
    </header>
  );
}

function SearchGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-2 py-1">
      <p className="px-2 py-1 text-caption font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      {children}
    </div>
  );
}

function SearchResult({ icon, label, meta, onClick }: { icon: ReactNode; label: string; meta: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-surface-50')}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-sm text-ink-700">{label}</span>
        <span className="block truncate text-caption text-ink-400">{meta}</span>
      </span>
      <ExternalLink size={13} strokeWidth={1.75} className="shrink-0 text-ink-300" />
    </button>
  );
}
