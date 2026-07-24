import { CheckCircle2, Circle, FlagTriangleRight } from 'lucide-react';
import type { Journey } from '../../types';
import { usePeople } from '../../lib/store';
import { getJourneyProgress } from '../../lib/selectors';
import { formatDisplayDate } from '../../lib/status';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';

export interface OverviewTabProps {
  journey: Journey;
}

export function OverviewTab({ journey }: OverviewTabProps) {
  const people = usePeople();
  const progress = getJourneyProgress(journey);
  const manager = people.find((p) => p.id === journey.managerId);
  const buddy = people.find((p) => p.id === journey.buddyId);

  const milestones = journey.tasks
    .filter((t) => t.type === 'milestone')
    .slice()
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-caption uppercase tracking-wide text-ink-400">Completed</p>
            <p className="mt-2 text-display text-success-700">{progress.completedTasks}</p>
          </Card>
          <Card>
            <p className="text-caption uppercase tracking-wide text-ink-400">Remaining</p>
            <p className="mt-2 text-display text-ink-800">{progress.totalTasks - progress.completedTasks}</p>
          </Card>
          <Card>
            <p className="text-caption uppercase tracking-wide text-ink-400">Overdue</p>
            <p className="mt-2 text-display text-danger-700">{progress.overdueTasks}</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-h3 text-ink-800">Upcoming milestones</h2>
          <div className="mt-4 flex flex-col divide-y divide-surface-100">
            {milestones.length === 0 && <p className="py-3 text-body-sm text-ink-400">No milestones defined for this journey.</p>}
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 size={18} strokeWidth={1.75} className="shrink-0 text-success-600" />
                  ) : (
                    <FlagTriangleRight size={18} strokeWidth={1.75} className="shrink-0 text-primary-500" />
                  )}
                  <div>
                    <p className="text-body font-medium text-ink-800">{milestone.title}</p>
                    <p className="text-body-sm text-ink-400">{formatDisplayDate(milestone.dueDate)}</p>
                  </div>
                </div>
                <StatusBadge status={milestone.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-5">
        <h2 className="text-h3 text-ink-800">Key people</h2>
        {manager && (
          <div className="flex items-center gap-3">
            <Avatar firstName={manager.firstName} lastName={manager.lastName} color={manager.avatarColor} />
            <div>
              <p className="text-body font-medium text-ink-800">{manager.firstName} {manager.lastName}</p>
              <p className="text-body-sm text-ink-400">Manager · {manager.role}</p>
            </div>
          </div>
        )}
        {buddy && (
          <div className="flex items-center gap-3">
            <Avatar firstName={buddy.firstName} lastName={buddy.lastName} color={buddy.avatarColor} />
            <div>
              <p className="text-body font-medium text-ink-800">{buddy.firstName} {buddy.lastName}</p>
              <p className="text-body-sm text-ink-400">Buddy · {buddy.role}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 text-body-sm text-ink-400">
          <Circle size={8} strokeWidth={0} className="fill-current" />
          {journey.tasks.filter((t) => t.mandatory).length} mandatory tasks in this journey
        </div>
      </Card>
    </div>
  );
}
