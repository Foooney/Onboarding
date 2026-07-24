import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CalendarClock, TrendingUp, Users } from 'lucide-react';
import { useJourneys, usePeople } from '../lib/store';
import {
  getActiveJourneys,
  getAverageProgress,
  getJourneyProgress,
  getJourneyStatusCounts,
  getNextDeadline,
  getOverdueTasks,
  getTasksDueThisWeek,
  getUpcomingMeetings,
  personName,
} from '../lib/selectors';
import { formatDisplayDate } from '../lib/status';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { Table, type TableColumn } from '../components/ui/Table';
import { ProgressBar } from '../components/ui/ProgressBar';
import { JourneyStatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { TaskCard } from '../components/ui/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import type { Journey, JourneyStatus } from '../types';

const STATUS_ORDER: JourneyStatus[] = ['on_track', 'at_risk', 'on_hold', 'not_started', 'completed'];
const STATUS_TONE: Record<JourneyStatus, string> = {
  not_started: 'bg-ink-300',
  on_track: 'bg-success-500',
  at_risk: 'bg-warning-500',
  on_hold: 'bg-danger-500',
  completed: 'bg-primary-400',
};

export function Dashboard() {
  const journeys = useJourneys();
  const people = usePeople();
  const navigate = useNavigate();

  const activeJourneys = getActiveJourneys(journeys);
  const inFlightCount = journeys.filter((j) => j.status === 'on_track' || j.status === 'at_risk' || j.status === 'on_hold').length;
  const averageProgress = getAverageProgress(activeJourneys);
  const overdueTasks = getOverdueTasks(journeys);
  const tasksThisWeek = getTasksDueThisWeek(journeys);
  const upcomingMeetings = getUpcomingMeetings(journeys);
  const statusCounts = getJourneyStatusCounts(journeys);
  const totalJourneys = journeys.length || 1;

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
      <div>
        <h1 className="text-display text-ink-800">Dashboard</h1>
        <p className="mt-1 text-body text-ink-500">A snapshot of every onboarding journey in flight.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active onboardings" value={inFlightCount} icon={TrendingUp} hint="Currently in progress" />
        <KpiCard label="Employees onboarding" value={activeJourneys.length} icon={Users} hint="Not yet completed" />
        <KpiCard label="Average progress" value={`${averageProgress}%`} icon={CalendarClock} hint="Across active journeys" />
        <KpiCard
          label="Overdue tasks"
          value={overdueTasks.length}
          icon={AlertTriangle}
          tone={overdueTasks.length > 0 ? 'danger' : 'default'}
          hint="Need attention now"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="text-h3 text-ink-800">Due this week</h2>
          <div className="mt-4 flex flex-col gap-3">
            {tasksThisWeek.length === 0 && <p className="text-body-sm text-ink-400">Nothing due in the next 7 days.</p>}
            {tasksThisWeek.slice(0, 5).map(({ journey, task }) => (
              <TaskCard
                key={task.id}
                compact
                task={{ id: task.id, title: task.title, status: task.status, priority: task.priority, dueDate: task.dueDate, type: task.type, ownerName: `${journey.employee.firstName} ${journey.employee.lastName}` }}
                onClick={() => navigate(`/journeys/${journey.id}`)}
              />
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h2 className="text-h3 text-ink-800">Upcoming meetings</h2>
          <div className="mt-4 flex flex-col gap-3">
            {upcomingMeetings.length === 0 && <p className="text-body-sm text-ink-400">No meetings scheduled in the next 2 weeks.</p>}
            {upcomingMeetings.slice(0, 5).map(({ journey, task }) => (
              <TaskCard
                key={task.id}
                compact
                task={{ id: task.id, title: task.title, status: task.status, priority: task.priority, dueDate: task.dueDate, type: task.type, ownerName: `${journey.employee.firstName} ${journey.employee.lastName}` }}
                onClick={() => navigate(`/journeys/${journey.id}`)}
              />
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h2 className="text-h3 text-ink-800">Onboardings by status</h2>
          <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-surface-100">
            {STATUS_ORDER.map((status) => (
              <div
                key={status}
                className={STATUS_TONE[status]}
                style={{ width: `${(statusCounts[status] / totalJourneys) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="flex items-center justify-between">
                <JourneyStatusBadge status={status} />
                <span className="text-body-sm font-medium text-ink-600">{statusCounts[status]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-h2 text-ink-800">Active Onboarding Journeys</h2>
        <Card className="mt-4" padding="none">
          {journeys.length === 0 ? (
            <EmptyState title="No onboarding journeys yet" description="Create the first onboarding to see it here." />
          ) : (
            <Table columns={columns} rows={journeys} getRowId={(j) => j.id} onRowClick={(j) => navigate(`/journeys/${j.id}`)} />
          )}
        </Card>
      </div>
    </div>
  );
}
