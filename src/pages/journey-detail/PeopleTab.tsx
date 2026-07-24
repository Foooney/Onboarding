import type { Journey } from '../../types';
import { usePeople } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';

export interface PeopleTabProps {
  journey: Journey;
}

export function PeopleTab({ journey }: PeopleTabProps) {
  const people = usePeople();
  const manager = people.find((p) => p.id === journey.managerId);
  const buddy = people.find((p) => p.id === journey.buddyId);

  const taskOwnerCounts = new Map<string, number>();
  for (const task of journey.tasks) {
    taskOwnerCounts.set(task.ownerId, (taskOwnerCounts.get(task.ownerId) ?? 0) + 1);
  }
  const involved = [...taskOwnerCounts.entries()]
    .filter(([id]) => id !== journey.managerId && id !== journey.buddyId)
    .map(([id, count]) => ({ person: people.find((p) => p.id === id), count }))
    .filter((entry): entry is { person: NonNullable<typeof entry.person>; count: number } => Boolean(entry.person))
    .sort((a, b) => b.count - a.count);

  const teamMembers = people.filter(
    (p) => p.team === journey.team && p.id !== journey.employee.id && p.id !== journey.managerId && p.id !== journey.buddyId,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {manager && <PersonCard person={manager} role="Manager" />}
        {buddy && <PersonCard person={buddy} role="Buddy" />}
      </div>

      <Card>
        <h2 className="text-h3 text-ink-800">People involved in this journey</h2>
        <div className="mt-4 flex flex-col divide-y divide-surface-100">
          {involved.length === 0 && <p className="py-3 text-body-sm text-ink-400">No other task owners yet.</p>}
          {involved.map(({ person, count }) => (
            <div key={person.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <Avatar firstName={person.firstName} lastName={person.lastName} color={person.avatarColor} />
                <div>
                  <p className="text-body font-medium text-ink-800">{person.firstName} {person.lastName}</p>
                  <p className="text-body-sm text-ink-400">{person.role}</p>
                </div>
              </div>
              <span className="text-body-sm text-ink-500">{count} task{count > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-h3 text-ink-800">Team members · {journey.team}</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {teamMembers.length === 0 && <p className="text-body-sm text-ink-400">No other team members on file yet.</p>}
          {teamMembers.map((person) => (
            <div key={person.id} className="flex items-center gap-2.5">
              <Avatar firstName={person.firstName} lastName={person.lastName} color={person.avatarColor} size="sm" />
              <div>
                <p className="text-body-sm font-medium text-ink-700">{person.firstName} {person.lastName}</p>
                <p className="text-caption text-ink-400">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PersonCard({ person, role }: { person: { firstName: string; lastName: string; avatarColor: string; role: string; email: string }; role: string }) {
  return (
    <Card className="flex items-center gap-4">
      <Avatar firstName={person.firstName} lastName={person.lastName} color={person.avatarColor} size="lg" />
      <div>
        <p className="text-body-lg font-semibold text-ink-800">{person.firstName} {person.lastName}</p>
        <p className="text-body-sm text-ink-500">{role} · {person.role}</p>
        <p className="text-body-sm text-ink-400">{person.email}</p>
      </div>
    </Card>
  );
}
