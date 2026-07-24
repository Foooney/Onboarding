import type { Id, Journey, JourneyProgress, JourneyStatus, JourneyTask, OnboardingTemplate, Person, TaskStatus, TaskStatusCounts } from '../types';
import { daysBetween, deriveTaskStatus, today } from './status';
import { PHASE_ORDER } from './phases';

export function effectiveStatus(task: JourneyTask, reference: Date = today()): TaskStatus {
  return deriveTaskStatus(task, reference);
}

export function getJourneyProgress(journey: Journey, reference: Date = today()): JourneyProgress {
  let completed = 0;
  let overdue = 0;
  let blocked = 0;
  for (const task of journey.tasks) {
    const status = effectiveStatus(task, reference);
    if (status === 'completed') completed += 1;
    else if (status === 'overdue') overdue += 1;
    else if (status === 'blocked') blocked += 1;
  }
  const total = journey.tasks.length;
  return {
    journeyId: journey.id,
    totalTasks: total,
    completedTasks: completed,
    overdueTasks: overdue,
    blockedTasks: blocked,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getTaskStatusCounts(tasks: JourneyTask[], reference: Date = today()): TaskStatusCounts {
  const counts: TaskStatusCounts = {
    not_started: 0,
    planned: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    blocked: 0,
    cancelled: 0,
  };
  for (const task of tasks) {
    counts[effectiveStatus(task, reference)] += 1;
  }
  return counts;
}

export interface JourneyTaskPair {
  journey: Journey;
  task: JourneyTask;
}

function byDueDate(reference: Date) {
  return (a: JourneyTaskPair, b: JourneyTaskPair) => daysBetween(a.task.dueDate, reference) - daysBetween(b.task.dueDate, reference);
}

export function getOverdueTasks(journeys: Journey[], reference: Date = today()): JourneyTaskPair[] {
  const result: JourneyTaskPair[] = [];
  for (const journey of journeys) {
    for (const task of journey.tasks) {
      if (effectiveStatus(task, reference) === 'overdue') result.push({ journey, task });
    }
  }
  return result.sort(byDueDate(reference));
}

export function getTasksDueThisWeek(journeys: Journey[], reference: Date = today()): JourneyTaskPair[] {
  const result: JourneyTaskPair[] = [];
  for (const journey of journeys) {
    for (const task of journey.tasks) {
      const status = effectiveStatus(task, reference);
      if (status === 'completed' || status === 'cancelled') continue;
      const delta = daysBetween(task.dueDate, reference);
      if (delta >= 0 && delta <= 7) result.push({ journey, task });
    }
  }
  return result.sort(byDueDate(reference));
}

export function getUpcomingMeetings(journeys: Journey[], reference: Date = today(), withinDays = 14): JourneyTaskPair[] {
  const result: JourneyTaskPair[] = [];
  for (const journey of journeys) {
    for (const task of journey.tasks) {
      if (task.type !== 'meeting') continue;
      const status = effectiveStatus(task, reference);
      if (status === 'completed' || status === 'cancelled') continue;
      const delta = daysBetween(task.dueDate, reference);
      if (delta >= 0 && delta <= withinDays) result.push({ journey, task });
    }
  }
  return result.sort(byDueDate(reference));
}

// Only tasks that are still ahead of us count as the "next" deadline — an
// overdue or blocked task is already surfaced elsewhere (progress counts,
// status badges) and showing a past date here as "next" reads as broken.
export function getNextDeadline(journey: Journey, reference: Date = today()): JourneyTask | undefined {
  return journey.tasks
    .filter((t) => {
      const status = effectiveStatus(t, reference);
      if (status === 'completed' || status === 'cancelled') return false;
      return daysBetween(t.dueDate, reference) >= 0;
    })
    .sort((a, b) => daysBetween(a.dueDate, reference) - daysBetween(b.dueDate, reference))[0];
}

export function getTasksOwnedBy(journeys: Journey[], personId: Id, reference: Date = today()): JourneyTaskPair[] {
  const result: JourneyTaskPair[] = [];
  for (const journey of journeys) {
    for (const task of journey.tasks) {
      if (task.ownerId === personId) result.push({ journey, task });
    }
  }
  return result.sort(byDueDate(reference));
}

export interface TeamAggregate {
  team: string;
  journeyCount: number;
  averageProgress: number;
}

export function getTeamAggregates(journeys: Journey[], reference: Date = today()): TeamAggregate[] {
  const byTeam = new Map<string, Journey[]>();
  for (const journey of journeys) {
    const list = byTeam.get(journey.team) ?? [];
    list.push(journey);
    byTeam.set(journey.team, list);
  }
  return [...byTeam.entries()]
    .map(([team, list]) => ({
      team,
      journeyCount: list.length,
      averageProgress: Math.round(list.reduce((sum, j) => sum + getJourneyProgress(j, reference).percentComplete, 0) / list.length),
    }))
    .sort((a, b) => b.journeyCount - a.journeyCount);
}

export interface ManagerAggregate {
  managerId: Id;
  managerName: string;
  journeyCount: number;
  averageProgress: number;
}

export function getManagerAggregates(journeys: Journey[], people: Person[], reference: Date = today()): ManagerAggregate[] {
  const byManager = new Map<Id, Journey[]>();
  for (const journey of journeys) {
    const list = byManager.get(journey.managerId) ?? [];
    list.push(journey);
    byManager.set(journey.managerId, list);
  }
  return [...byManager.entries()]
    .map(([managerId, list]) => {
      const manager = people.find((p) => p.id === managerId);
      return {
        managerId,
        managerName: manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown manager',
        journeyCount: list.length,
        averageProgress: Math.round(list.reduce((sum, j) => sum + getJourneyProgress(j, reference).percentComplete, 0) / list.length),
      };
    })
    .sort((a, b) => b.journeyCount - a.journeyCount);
}

export function getAverageProgress(journeys: Journey[], reference: Date = today()): number {
  if (journeys.length === 0) return 0;
  return Math.round(journeys.reduce((sum, j) => sum + getJourneyProgress(j, reference).percentComplete, 0) / journeys.length);
}

export function getActiveJourneys(journeys: Journey[]): Journey[] {
  return journeys.filter((j) => j.status !== 'completed');
}

export function getJourneyStatusCounts(journeys: Journey[]): Record<JourneyStatus, number> {
  const counts: Record<JourneyStatus, number> = {
    not_started: 0,
    on_track: 0,
    at_risk: 0,
    on_hold: 0,
    completed: 0,
  };
  for (const journey of journeys) counts[journey.status] += 1;
  return counts;
}

export function findPerson(people: Person[], id: Id): Person | undefined {
  return people.find((p) => p.id === id);
}

export function findJourney(journeys: Journey[], id: Id): Journey | undefined {
  return journeys.find((j) => j.id === id);
}

export function personName(people: Person[], id: Id): string {
  const person = findPerson(people, id);
  return person ? `${person.firstName} ${person.lastName}` : 'Unknown';
}

export interface OverdueTaskFrequency {
  title: string;
  count: number;
}

export function getMostOverdueTasks(journeys: Journey[], limit = 5, reference: Date = today()): OverdueTaskFrequency[] {
  const counts = new Map<string, number>();
  for (const { title } of getOverdueTasks(journeys, reference).map((p) => p.task)) {
    counts.set(title, (counts.get(title) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface PhaseCompletion {
  phase: (typeof PHASE_ORDER)[number];
  total: number;
  completed: number;
  percent: number;
}

/**
 * Completion rate of tasks scheduled within each phase, aggregated across all
 * journeys right now — the closest proxy this data model supports for
 * "completion at 30/60/90 days" without historical daily snapshots.
 */
export function getPhaseCompletionRates(journeys: Journey[]): PhaseCompletion[] {
  return PHASE_ORDER.map((phase) => {
    let total = 0;
    let completed = 0;
    for (const journey of journeys) {
      for (const task of journey.tasks) {
        if (task.phase !== phase) continue;
        total += 1;
        if (task.status === 'completed') completed += 1;
      }
    }
    return { phase, total, completed, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  });
}

export interface MonthlyOnboardingCount {
  month: string;
  count: number;
}

export function getJourneysByMonth(journeys: Journey[]): MonthlyOnboardingCount[] {
  const buckets = new Map<string, { label: string; count: number }>();
  for (const journey of journeys) {
    const [year, month] = journey.startDate.split('-');
    const key = `${year}-${month}`;
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const bucket = buckets.get(key);
    if (bucket) bucket.count += 1;
    else buckets.set(key, { label, count: 1 });
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, { label, count }]) => ({ month: label, count }));
}

export function getAverageTemplateDuration(journeys: Journey[], templates: OnboardingTemplate[]): number {
  const durations = journeys
    .map((j) => templates.find((t) => t.id === j.templateId)?.durationDays)
    .filter((d): d is number => typeof d === 'number');
  if (durations.length === 0) return 0;
  return Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length);
}
