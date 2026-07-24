import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Route } from 'lucide-react';
import { useJourneys, usePeople } from '../../lib/store';
import { findJourney, getJourneyProgress, personName } from '../../lib/selectors';
import { formatDisplayDate } from '../../lib/status';
import { Avatar } from '../../components/ui/Avatar';
import { JourneyStatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { OverviewTab } from './OverviewTab';
import { JourneyTab } from './JourneyTab';
import { TasksTab } from './TasksTab';
import { PeopleTab } from './PeopleTab';
import { DocumentsTab } from './DocumentsTab';
import { ActivityTab } from './ActivityTab';

const TAB_KEYS = ['overview', 'journey', 'tasks', 'people', 'documents', 'activity'] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  overview: 'Overview',
  journey: 'Journey',
  tasks: 'Tasks',
  people: 'People',
  documents: 'Documents',
  activity: 'Activity',
};

export function JourneyDetail() {
  const { id } = useParams<{ id: string }>();
  const journeys = useJourneys();
  const people = usePeople();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const journey = id ? findJourney(journeys, id) : undefined;

  if (!journey) {
    return (
      <EmptyState
        icon={Route}
        title="Journey not found"
        description="This onboarding journey may have been removed or the link is out of date."
        action={{ label: 'Back to journeys', onClick: () => navigate('/journeys') }}
      />
    );
  }

  const progress = getJourneyProgress(journey);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/journeys" className="inline-flex w-fit items-center gap-1.5 text-body-sm font-medium text-ink-500 hover:text-ink-700">
        <ArrowLeft size={15} strokeWidth={1.75} />
        Onboarding Journeys
      </Link>

      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar firstName={journey.employee.firstName} lastName={journey.employee.lastName} color={journey.employee.avatarColor} size="lg" />
            <div>
              <h1 className="text-h1 text-ink-800">{journey.employee.firstName} {journey.employee.lastName}</h1>
              <p className="text-body text-ink-500">{journey.position} · {journey.team}</p>
            </div>
          </div>
          <JourneyStatusBadge status={journey.status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-body-sm sm:grid-cols-3 lg:grid-cols-6">
          <Fact label="Manager" value={personName(people, journey.managerId)} />
          <Fact label="Buddy" value={personName(people, journey.buddyId)} />
          <Fact label="Start date" value={formatDisplayDate(journey.startDate)} />
          <Fact label="Location" value={journey.location} icon={MapPin} />
          <Fact label="Contract" value={journey.contractType.replace('_', ' ')} />
          <Fact label="Department" value={journey.department} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-body-sm text-ink-500">
            <span>
              {progress.completedTasks} of {progress.totalTasks} tasks completed
              {progress.overdueTasks > 0 && <span className="ml-2 font-medium text-danger-700">{progress.overdueTasks} overdue</span>}
              {progress.blockedTasks > 0 && <span className="ml-2 font-medium text-warning-700">{progress.blockedTasks} blocked</span>}
            </span>
            <span className="font-medium text-ink-700">{progress.percentComplete}%</span>
          </div>
          <ProgressBar value={progress.percentComplete} className="mt-2" />
        </div>
      </div>

      <Tabs
        tabs={TAB_KEYS.map((key) => ({
          key,
          label: TAB_LABELS[key],
          count: key === 'tasks' ? journey.tasks.length : undefined,
        }))}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {activeTab === 'overview' && <OverviewTab journey={journey} />}
      {activeTab === 'journey' && <JourneyTab journey={journey} />}
      {activeTab === 'tasks' && <TasksTab journey={journey} />}
      {activeTab === 'people' && <PeopleTab journey={journey} />}
      {activeTab === 'documents' && <DocumentsTab journey={journey} />}
      {activeTab === 'activity' && <ActivityTab journey={journey} />}
    </div>
  );
}

function Fact({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof MapPin }) {
  return (
    <div>
      <p className="text-caption uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 flex items-center gap-1 font-medium capitalize text-ink-700">
        {Icon && <Icon size={13} strokeWidth={1.75} className="shrink-0 text-ink-400" />}
        {value}
      </p>
    </div>
  );
}
