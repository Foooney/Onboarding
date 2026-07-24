import type { JourneyTask, TaskStatus } from '../types';

// Statuses that must never be silently overwritten by a computed 'overdue' —
// completed/cancelled are terminal, and 'blocked' already explains itself.
const EXEMPT_FROM_OVERDUE: TaskStatus[] = ['completed', 'cancelled', 'blocked'];

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Today at midnight, local time — the single reference point for the whole app. */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/** Positive when `from` is in the future relative to `reference`, negative when in the past. */
export function daysBetween(from: string, reference: Date = today()): number {
  return Math.round((parseDate(from).getTime() - reference.getTime()) / (1000 * 60 * 60 * 24));
}

export function isPastDue(dueDate: string, reference: Date = today()): boolean {
  return daysBetween(dueDate, reference) < 0;
}

/**
 * The seed (and the store) never persist 'overdue' directly — a task's stored
 * status stays whatever it last was (not_started/planned/in_progress/blocked),
 * and 'overdue' is computed here from the due date against "today" so the demo
 * stays coherent no matter which day it is opened on.
 */
export function deriveTaskStatus(
  task: Pick<JourneyTask, 'status' | 'dueDate'>,
  reference: Date = today(),
): TaskStatus {
  if (EXEMPT_FROM_OVERDUE.includes(task.status)) return task.status;
  if (isPastDue(task.dueDate, reference)) return 'overdue';
  return task.status;
}

export function formatDisplayDate(value: string): string {
  return parseDate(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
