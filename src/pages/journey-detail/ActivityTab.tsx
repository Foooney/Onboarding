import {
  Bell,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  MinusCircle,
  Pencil,
  PlusCircle,
  RefreshCw,
  Sparkles,
  UserCog,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ActivityType, Journey } from '../../types';
import { usePeople } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Timeline, type TimelineItem } from '../../components/ui/Timeline';
import { EmptyState } from '../../components/ui/EmptyState';

export interface ActivityTabProps {
  journey: Journey;
}

const ACTIVITY_ICON: Record<ActivityType, LucideIcon> = {
  journey_created: Sparkles,
  journey_updated: Pencil,
  task_completed: CheckCircle2,
  task_status_changed: RefreshCw,
  task_added: PlusCircle,
  task_removed: MinusCircle,
  task_rescheduled: CalendarClock,
  task_reassigned: UserCog,
  comment_added: MessageSquare,
  reminder_sent: Bell,
};

const ACTIVITY_TONE: Record<ActivityType, TimelineItem['tone']> = {
  journey_created: 'success',
  journey_updated: 'default',
  task_completed: 'success',
  task_status_changed: 'default',
  task_added: 'default',
  task_removed: 'danger',
  task_rescheduled: 'warning',
  task_reassigned: 'default',
  comment_added: 'default',
  reminder_sent: 'warning',
};

export function ActivityTab({ journey }: ActivityTabProps) {
  const people = usePeople();

  const entries = journey.activity
    .slice()
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  if (entries.length === 0) {
    return <EmptyState title="No activity yet" description="Every change made to this journey will be logged here." />;
  }

  const items: TimelineItem[] = entries.map((entry) => {
    const actor = people.find((p) => p.id === entry.actorId);
    const date = new Date(entry.timestamp);
    return {
      id: entry.id,
      title: entry.message,
      meta: `${actor ? `${actor.firstName} ${actor.lastName}` : 'System'} · ${date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      icon: ACTIVITY_ICON[entry.type],
      tone: ACTIVITY_TONE[entry.type],
    };
  });

  return (
    <Card>
      <Timeline items={items} />
    </Card>
  );
}
