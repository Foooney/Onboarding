import type { Journey } from '../../types';
import { usePeople } from '../../lib/store';
import { effectiveStatus } from '../../lib/selectors';
import { formatDisplayDate } from '../../lib/status';
import { PHASE_LABEL, PHASE_ORDER } from '../../lib/phases';
import { Card } from '../../components/ui/Card';
import { Timeline, type TimelineItem } from '../../components/ui/Timeline';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';

export interface JourneyTabProps {
  journey: Journey;
}

const STATUS_TONE = {
  completed: 'success',
  overdue: 'danger',
  blocked: 'warning',
} as const;

export function JourneyTab({ journey }: JourneyTabProps) {
  const people = usePeople();

  return (
    <div className="flex flex-col gap-6">
      {PHASE_ORDER.map((phase) => {
        const tasks = journey.tasks.filter((t) => t.phase === phase).slice().sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
        if (tasks.length === 0) return null;

        const items: TimelineItem[] = tasks.map((task) => {
          const status = effectiveStatus(task);
          const owner = people.find((p) => p.id === task.ownerId);
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            meta: `${owner ? `${owner.firstName} ${owner.lastName}` : 'Unassigned'} · ${formatDisplayDate(task.dueDate)}`,
            tone: STATUS_TONE[status as keyof typeof STATUS_TONE] ?? 'default',
            content: (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <PriorityBadge priority={task.priority} />
              </div>
            ),
          };
        });

        return (
          <Card key={phase}>
            <h2 className="text-h3 text-ink-800">{PHASE_LABEL[phase]}</h2>
            <Timeline items={items} className="mt-5" />
          </Card>
        );
      })}
    </div>
  );
}
