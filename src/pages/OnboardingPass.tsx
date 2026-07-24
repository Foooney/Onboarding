import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FlagTriangleRight,
  GraduationCap,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { useApp, useJourneys } from '../lib/store';
import {
  effectiveStatus,
  getJourneyProgress,
  getNextDeadline,
  getOverdueTasks,
  getTasksDueThisWeek,
} from '../lib/selectors';
import { daysBetween, formatDate, formatDisplayDate, today } from '../lib/status';
import { PHASE_LABEL, PHASE_ORDER } from '../lib/phases';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { TaskCard } from '../components/ui/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { buttonClasses, cx } from '../lib/utils';
import type { Journey, JourneyTask } from '../types';

export function OnboardingPass() {
  const journeys = useJourneys();
  const { people, currentUser, taskLibrary, setTaskStatus } = useApp();
  const { showToast } = useToast();

  const journey: Journey | undefined =
    journeys.find((j) => j.employee.id === currentUser.id) ?? journeys.find((j) => j.id === 'journey-anna-mueller') ?? journeys[0];

  if (!journey) {
    return <EmptyState title="No onboarding journey yet" description="Once a journey is created, it will show up here." />;
  }

  const progress = getJourneyProgress(journey);
  const elapsedDays = -daysBetween(journey.startDate) + 1;
  const manager = people.find((p) => p.id === journey.managerId);
  const buddy = people.find((p) => p.id === journey.buddyId);

  const overdue = getOverdueTasks([journey]);
  const nextTask = overdue[0]?.task ?? getNextDeadline(journey);

  const todayStr = formatDate(today());
  const todayTasks = journey.tasks.filter((t) => t.dueDate === todayStr && !['completed', 'cancelled'].includes(effectiveStatus(t)));
  const weekTasks = getTasksDueThisWeek([journey]).map((p) => p.task).filter((t) => t.id !== nextTask?.id);

  const ownerIds = new Set(journey.tasks.map((t) => t.ownerId));
  ownerIds.delete(journey.managerId);
  ownerIds.delete(journey.buddyId);
  const otherPeople = [...ownerIds].map((id) => people.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const trainings = journey.tasks
    .filter((t) => t.type === 'training' && !['completed', 'cancelled'].includes(effectiveStatus(t)))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 4);

  const documents = (() => {
    const seen = new Set<string>();
    const list: Array<{ task: JourneyTask; label: string; url: string }> = [];
    for (const task of journey.tasks) {
      if (['completed', 'cancelled'].includes(effectiveStatus(task))) continue;
      if (!task.templateId || seen.has(task.templateId)) continue;
      const template = taskLibrary.find((t) => t.id === task.templateId);
      if (!template?.resourceUrl) continue;
      seen.add(template.id);
      list.push({ task, label: template.resourceLabel ?? template.title, url: template.resourceUrl });
    }
    return list.slice(0, 5);
  })();

  const milestonesReached = journey.tasks
    .filter((t) => t.type === 'milestone' && t.status === 'completed')
    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1));

  // The phase the journey is "in": the first phase that isn't fully done yet.
  const phaseStats = PHASE_ORDER.map((phase) => {
    const tasks = journey.tasks.filter((t) => t.phase === phase);
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { phase, total: tasks.length, completed };
  });
  const currentPhaseIndex = phaseStats.findIndex((p) => p.total > 0 && p.completed < p.total);

  function completeTask(taskId: string, title: string) {
    // `journey` is guaranteed defined here (the !journey guard above already
    // returned) — TS just can't see that across this closure boundary.
    setTaskStatus(journey!.id, taskId, 'completed');
    showToast(`Nice work — "${title}" marked as completed.`, 'success');
  }

  return (
    <div className="flex flex-col gap-6">
      <PassHeader journey={journey} elapsedDays={elapsedDays} percentComplete={progress.percentComplete} />

      <Card>
        <h2 className="text-h3 text-ink-800">Your roadmap</h2>
        <PhaseRoadmap stats={phaseStats} currentIndex={currentPhaseIndex} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {nextTask && (
            <Card className={cx('border-2', overdue[0] ? 'border-danger-200 bg-danger-50/30' : 'border-primary-200 bg-primary-50/30')}>
              <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
                {overdue[0] ? 'Overdue — do this first' : 'Up next'}
              </p>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-h2 text-ink-800">{nextTask.title}</h3>
                  <p className="mt-1 max-w-lg text-body-sm text-ink-500">{nextTask.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={effectiveStatus(nextTask)} />
                    <PriorityBadge priority={nextTask.priority} />
                    <span className="text-body-sm text-ink-400">Due {formatDisplayDate(nextTask.dueDate)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => completeTask(nextTask.id, nextTask.title)} className={buttonClasses('primary')}>
                  <CheckCircle2 size={16} strokeWidth={2} />
                  Mark as done
                </button>
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-h3 text-ink-800">Today</h2>
            <div className="mt-4 flex flex-col gap-3">
              {todayTasks.length === 0 && <p className="text-body-sm text-ink-400">Nothing due today — you're all caught up.</p>}
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={{ id: task.id, title: task.title, status: effectiveStatus(task), priority: task.priority, dueDate: task.dueDate, type: task.type }}
                />
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-h3 text-ink-800">This week</h2>
            <div className="mt-4 flex flex-col gap-3">
              {weekTasks.length === 0 && <p className="text-body-sm text-ink-400">No other tasks due in the next 7 days.</p>}
              {weekTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  compact
                  task={{ id: task.id, title: task.title, status: effectiveStatus(task), priority: task.priority, dueDate: task.dueDate, type: task.type }}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="flex items-center gap-2 text-h3 text-ink-800"><Users size={17} strokeWidth={1.75} /> People to meet</h2>
            <div className="mt-4 flex flex-col gap-3">
              {manager && <PersonRow person={manager} role="Manager" />}
              {buddy && <PersonRow person={buddy} role="Buddy" />}
              {otherPeople.map((p) => <PersonRow key={p.id} person={p} role={p.role} />)}
            </div>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-h3 text-ink-800"><GraduationCap size={17} strokeWidth={1.75} /> Upcoming training</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              {trainings.length === 0 && <p className="text-body-sm text-ink-400">No training sessions scheduled.</p>}
              {trainings.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <span className="text-body-sm text-ink-700">{t.title}</span>
                  <span className="shrink-0 text-body-sm text-ink-400">{formatDisplayDate(t.dueDate)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-h3 text-ink-800"><BookOpen size={17} strokeWidth={1.75} /> Documents to review</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              {documents.length === 0 && <p className="text-body-sm text-ink-400">Nothing pending.</p>}
              {documents.map((d) => (
                <a key={d.task.id} href={d.url} target="_blank" rel="noreferrer" className="block text-body-sm text-primary-700 hover:underline">
                  {d.label}
                </a>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-h3 text-ink-800"><Trophy size={17} strokeWidth={1.75} /> Milestones reached</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              {milestonesReached.length === 0 && <p className="text-body-sm text-ink-400">Your first milestone is on its way.</p>}
              {milestonesReached.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <FlagTriangleRight size={14} strokeWidth={1.75} className="shrink-0 text-success-600" />
                  <span className="text-body-sm text-ink-700">{m.title}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PersonRow({ person, role }: { person: { firstName: string; lastName: string; avatarColor: string }; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar firstName={person.firstName} lastName={person.lastName} color={person.avatarColor} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-body-sm font-medium text-ink-700">{person.firstName} {person.lastName}</p>
        <p className="truncate text-caption text-ink-400">{role}</p>
      </div>
    </div>
  );
}

function PassHeader({ journey, elapsedDays, percentComplete }: { journey: Journey; elapsedDays: number; percentComplete: number }) {
  const dayLabel = elapsedDays < 1 ? `Starts in ${1 - elapsedDays} day${1 - elapsedDays === 1 ? '' : 's'}` : `Day ${elapsedDays} of your journey`;
  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="flex flex-1 items-center gap-5 p-6">
          <Avatar firstName={journey.employee.firstName} lastName={journey.employee.lastName} color={journey.employee.avatarColor} size="xl" />
          <div>
            <p className="text-caption font-semibold uppercase tracking-wide text-primary-600">
              <Sparkles size={12} strokeWidth={2} className="mr-1 inline -translate-y-px" />
              Onboarding Pass
            </p>
            <h1 className="mt-1 text-h1 text-ink-800">Welcome, {journey.employee.firstName}!</h1>
            <p className="mt-1 text-body text-ink-500">{journey.position} · {journey.team}</p>
            <p className="mt-2 flex items-center gap-1.5 text-body-sm text-ink-400">
              <MapPin size={13} strokeWidth={1.75} /> {journey.location}
              <span className="mx-1 text-ink-200">•</span>
              <Calendar size={13} strokeWidth={1.75} /> Started {formatDisplayDate(journey.startDate)}
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-center sm:w-px">
          <div className="hidden h-[85%] w-px self-center border-l border-dashed border-surface-200 sm:block" />
          <span className="absolute -top-2 hidden h-4 w-4 rounded-full bg-surface-50 sm:block" />
          <span className="absolute -bottom-2 hidden h-4 w-4 rounded-full bg-surface-50 sm:block" />
        </div>

        <div className="flex flex-1 items-center justify-center gap-5 border-t border-surface-100 p-6 sm:border-t-0">
          <ProgressRing percent={percentComplete} />
          <div>
            <p className="text-body-lg font-semibold text-ink-800">{dayLabel}</p>
            <p className="text-body-sm text-ink-500">{percentComplete}% of your onboarding complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ percent, size = 88 }: { percent: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7EAED" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1D8C8B"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-h3 text-ink-800">{percent}%</div>
    </div>
  );
}

function PhaseRoadmap({ stats, currentIndex }: { stats: Array<{ phase: (typeof PHASE_ORDER)[number]; total: number; completed: number }>; currentIndex: number }) {
  return (
    <div className="mt-6 flex items-start">
      {stats.map((s, index) => {
        const state = currentIndex === -1 ? 'done' : index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <div key={s.phase} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <span
                className={cx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-body-sm font-semibold',
                  state === 'done' && 'bg-primary-600 text-white',
                  state === 'current' && 'bg-primary-50 text-primary-700 ring-2 ring-primary-500',
                  state === 'upcoming' && 'bg-surface-100 text-ink-400',
                )}
              >
                {state === 'done' ? <CheckCircle2 size={16} strokeWidth={2} /> : index + 1}
              </span>
              {index < stats.length - 1 && (
                <span className={cx('mx-1 h-px flex-1', state === 'done' ? 'bg-primary-500' : 'bg-surface-200')} />
              )}
            </div>
            <div className="mt-2 text-center">
              <p className={cx('text-caption font-medium', state === 'upcoming' ? 'text-ink-400' : 'text-ink-700')}>{PHASE_LABEL[s.phase]}</p>
              <p className="text-caption text-ink-400">{s.completed}/{s.total}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
