import { FlagTriangleRight } from 'lucide-react';
import { usePeople, useTemplates } from '../../lib/store';
import { formatDisplayDate } from '../../lib/status';
import { PHASE_LABEL, PHASE_ORDER } from '../../lib/phases';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import type { WizardDraft } from './wizardTypes';

export interface StepReviewProps {
  draft: WizardDraft;
}

export function StepReview({ draft }: StepReviewProps) {
  const people = usePeople();
  const templates = useTemplates();

  const existingEmployee = draft.employeeMode === 'existing' ? people.find((p) => p.id === draft.existingEmployeeId) : undefined;
  const firstName = existingEmployee?.firstName ?? draft.newFirstName;
  const lastName = existingEmployee?.lastName ?? draft.newLastName;
  const avatarColor = existingEmployee?.avatarColor ?? draft.newAvatarColor;
  const manager = people.find((p) => p.id === draft.managerId);
  const buddy = people.find((p) => p.id === draft.buddyId);
  const template = templates.find((t) => t.id === draft.templateId);

  const phaseCounts = PHASE_ORDER.map((phase) => ({ phase, count: draft.tasks.filter((t) => t.phase === phase).length })).filter((p) => p.count > 0);

  const involvedCounts = new Map<string, number>();
  for (const task of draft.tasks) involvedCounts.set(task.ownerId, (involvedCounts.get(task.ownerId) ?? 0) + 1);
  const involved = [...involvedCounts.entries()]
    .map(([id, count]) => ({ person: people.find((p) => p.id === id), count }))
    .filter((e): e is { person: NonNullable<typeof e.person>; count: number } => Boolean(e.person))
    .sort((a, b) => b.count - a.count);

  const milestones = draft.tasks.filter((t) => t.type === 'milestone').slice().sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  const projectedCompletion = draft.tasks.reduce((latest, t) => (t.dueDate > latest ? t.dueDate : latest), draft.startDate);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h3 text-ink-800">Review and launch</h2>
        <p className="mt-1 text-body-sm text-ink-500">Double-check everything below, then launch the onboarding.</p>
      </div>

      <Card className="flex flex-wrap items-center gap-4">
        <Avatar firstName={firstName || '?'} lastName={lastName || '?'} color={avatarColor} size="lg" />
        <div>
          <p className="text-body-lg font-semibold text-ink-800">{firstName} {lastName}</p>
          <p className="text-body-sm text-ink-500">{draft.position} · {draft.team} · {draft.department}</p>
          <p className="text-body-sm text-ink-400">Starts {draft.startDate ? formatDisplayDate(draft.startDate) : '—'} · {draft.location}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-caption uppercase tracking-wide text-ink-400">Manager</p>
          <p className="mt-1 font-medium text-ink-800">{manager ? `${manager.firstName} ${manager.lastName}` : '—'}</p>
        </Card>
        <Card>
          <p className="text-caption uppercase tracking-wide text-ink-400">Buddy</p>
          <p className="mt-1 font-medium text-ink-800">{buddy ? `${buddy.firstName} ${buddy.lastName}` : '—'}</p>
        </Card>
        <Card>
          <p className="text-caption uppercase tracking-wide text-ink-400">Template</p>
          <p className="mt-1 font-medium text-ink-800">{template?.name ?? '—'}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-h3 text-ink-800">{draft.tasks.length} tasks planned</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {phaseCounts.map(({ phase, count }) => (
            <span key={phase} className="rounded-full bg-surface-100 px-2.5 py-1 text-caption text-ink-600">{PHASE_LABEL[phase]}: {count}</span>
          ))}
        </div>
        <p className="mt-3 text-body-sm text-ink-500">Projected completion around {projectedCompletion ? formatDisplayDate(projectedCompletion) : '—'}.</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="text-h3 text-ink-800">People involved</h3>
          <div className="mt-3 flex flex-col gap-2.5">
            {involved.length === 0 && <p className="text-body-sm text-ink-400">No tasks assigned yet.</p>}
            {involved.map(({ person, count }) => (
              <div key={person.id} className="flex items-center justify-between">
                <span className="text-body-sm text-ink-700">{person.firstName} {person.lastName}</span>
                <span className="text-body-sm text-ink-400">{count} task{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-h3 text-ink-800">Key milestones</h3>
          <div className="mt-3 flex flex-col gap-2.5">
            {milestones.length === 0 && <p className="text-body-sm text-ink-400">No milestones in this journey.</p>}
            {milestones.map((m) => (
              <div key={m.key} className="flex items-center gap-2">
                <FlagTriangleRight size={14} strokeWidth={1.75} className="shrink-0 text-primary-500" />
                <span className="text-body-sm text-ink-700">{m.title}</span>
                <span className="ml-auto text-body-sm text-ink-400">{formatDisplayDate(m.dueDate)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
