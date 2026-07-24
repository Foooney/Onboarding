import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useJourneys, usePeople } from '../lib/store';
import { getJourneyProgress, getNextDeadline, personName } from '../lib/selectors';
import { daysBetween, formatDisplayDate } from '../lib/status';
import type { Id, Journey, JourneyStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Table, type TableColumn } from '../components/ui/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterBar } from '../components/ui/FilterBar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { JourneyStatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { buttonClasses, cx } from '../lib/utils';

type Period = 'all' | 'upcoming' | 'last_30' | 'last_90' | 'older';

const SELECT_CLASSES =
  'rounded-lg border border-surface-200 bg-white px-3 py-2 text-body-sm text-ink-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100';

function periodOf(startDate: string): Period {
  const delta = daysBetween(startDate);
  if (delta > 0) return 'upcoming';
  if (delta >= -30) return 'last_30';
  if (delta >= -90) return 'last_90';
  return 'older';
}

const PERIOD_LABEL: Record<Period, string> = {
  all: 'All periods',
  upcoming: 'Starting soon',
  last_30: 'Started last 30 days',
  last_90: 'Started last 90 days',
  older: 'Started earlier',
};

export function JourneysList() {
  const journeys = useJourneys();
  const people = usePeople();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JourneyStatus | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<Id | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<Period>('all');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const teams = useMemo(() => [...new Set(journeys.map((j) => j.team))].sort(), [journeys]);
  const managers = useMemo(() => {
    const ids = [...new Set(journeys.map((j) => j.managerId))];
    return ids.map((id) => ({ id, name: personName(people, id) })).sort((a, b) => a.name.localeCompare(b.name));
  }, [journeys, people]);

  const filtered = journeys.filter((j) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${j.employee.firstName} ${j.employee.lastName}`.toLowerCase().includes(query) ||
      j.position.toLowerCase().includes(query) ||
      j.team.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchesTeam = teamFilter === 'all' || j.team === teamFilter;
    const matchesManager = managerFilter === 'all' || j.managerId === managerFilter;
    const matchesPeriod = periodFilter === 'all' || periodOf(j.startDate) === periodFilter;
    return matchesSearch && matchesStatus && matchesTeam && matchesManager && matchesPeriod;
  });

  const activeFilterCount = [statusFilter, teamFilter, managerFilter, periodFilter].filter((v) => v !== 'all').length;

  function clearFilters() {
    setStatusFilter('all');
    setTeamFilter('all');
    setManagerFilter('all');
    setPeriodFilter('all');
    setSearch('');
  }

  const columns: TableColumn<Journey>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortValue: (j) => `${j.employee.firstName} ${j.employee.lastName}`,
      render: (j) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={j.employee.firstName} lastName={j.employee.lastName} color={j.employee.avatarColor} size="sm" />
          <div>
            <p className="font-medium text-ink-800">{j.employee.firstName} {j.employee.lastName}</p>
            <p className="text-body-sm text-ink-400">{j.position}</p>
          </div>
        </div>
      ),
    },
    { key: 'team', header: 'Team', sortValue: (j) => j.team, render: (j) => j.team },
    { key: 'manager', header: 'Manager', sortValue: (j) => personName(people, j.managerId), render: (j) => personName(people, j.managerId) },
    { key: 'startDate', header: 'Start date', sortValue: (j) => j.startDate, render: (j) => formatDisplayDate(j.startDate) },
    {
      key: 'progress',
      header: 'Progress',
      width: '160px',
      sortValue: (j) => getJourneyProgress(j).percentComplete,
      render: (j) => <ProgressBar value={getJourneyProgress(j).percentComplete} showLabel />,
    },
    {
      key: 'nextDeadline',
      header: 'Next deadline',
      render: (j) => {
        const next = getNextDeadline(j);
        return next ? formatDisplayDate(next.dueDate) : '—';
      },
    },
    { key: 'status', header: 'Status', render: (j) => <JourneyStatusBadge status={j.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-ink-800">Onboarding Journeys</h1>
          <p className="mt-1 text-body text-ink-500">{filtered.length} of {journeys.length} journeys</p>
        </div>
        <Link to="/journeys/new" className={buttonClasses('primary')}>
          <Plus size={16} strokeWidth={2} />
          Create onboarding
        </Link>
      </div>

      <FilterBar activeFilterCount={activeFilterCount} onClearAll={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, position or team…" className="w-72" />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as JourneyStatus | 'all')} className={SELECT_CLASSES}>
          <option value="all">All statuses</option>
          <option value="on_track">On track</option>
          <option value="at_risk">At risk</option>
          <option value="on_hold">On hold</option>
          <option value="not_started">Not started</option>
          <option value="completed">Completed</option>
        </select>

        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className={SELECT_CLASSES}>
          <option value="all">All teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>

        <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className={SELECT_CLASSES}>
          <option value="all">All managers</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value as Period)} className={SELECT_CLASSES}>
          {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
            <option key={p} value={p}>{PERIOD_LABEL[p]}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-surface-200 p-1">
          <button
            type="button"
            onClick={() => setView('table')}
            aria-label="Table view"
            aria-pressed={view === 'table'}
            className={cx('rounded-md p-1.5', view === 'table' ? 'bg-primary-50 text-primary-700' : 'text-ink-400 hover:text-ink-600')}
          >
            <List size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => setView('cards')}
            aria-label="Card view"
            aria-pressed={view === 'cards'}
            className={cx('rounded-md p-1.5', view === 'cards' ? 'bg-primary-50 text-primary-700' : 'text-ink-400 hover:text-ink-600')}
          >
            <LayoutGrid size={16} strokeWidth={1.75} />
          </button>
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No journeys match these filters" description="Try clearing a filter or searching for something else." action={{ label: 'Clear filters', onClick: clearFilters }} />
      ) : view === 'table' ? (
        <Card padding="none">
          <Table columns={columns} rows={filtered} getRowId={(j) => j.id} onRowClick={(j) => navigate(`/journeys/${j.id}`)} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} managerName={personName(people, journey.managerId)} onClick={() => navigate(`/journeys/${journey.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function JourneyCard({ journey, managerName, onClick }: { journey: Journey; managerName: string; onClick: () => void }) {
  const progress = getJourneyProgress(journey);
  const nextDeadline = getNextDeadline(journey);
  return (
    <Card className="cursor-pointer hover:border-primary-200" padding="md">
      <div onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar firstName={journey.employee.firstName} lastName={journey.employee.lastName} color={journey.employee.avatarColor} size="lg" />
            <div>
              <p className="font-semibold text-ink-800">{journey.employee.firstName} {journey.employee.lastName}</p>
              <p className="text-body-sm text-ink-500">{journey.position}</p>
            </div>
          </div>
          <JourneyStatusBadge status={journey.status} />
        </div>
        <div className="mt-4 space-y-1.5 text-body-sm text-ink-500">
          <p>{journey.team}</p>
          <p>Manager: {managerName}</p>
          <p>Started {formatDisplayDate(journey.startDate)}</p>
          <p>Next: {nextDeadline ? formatDisplayDate(nextDeadline.dueDate) : '—'}</p>
        </div>
        <ProgressBar value={progress.percentComplete} showLabel className="mt-4" />
      </div>
    </Card>
  );
}
