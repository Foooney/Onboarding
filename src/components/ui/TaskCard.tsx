import { Calendar, Clock, FileText, GraduationCap, KeyRound, ListChecks, PlayCircle, ShieldCheck, Users, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Priority, TaskStatus, TaskType } from '../../types';
import { PriorityBadge, StatusBadge } from './Badge';
import { cx } from '../../lib/utils';

export interface TaskCardTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  type: TaskType;
  ownerName?: string;
}

export interface TaskCardProps {
  task: TaskCardTask;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

const TYPE_ICON: Record<TaskType, LucideIcon> = {
  task: ListChecks,
  meeting: Users,
  training: GraduationCap,
  reading: FileText,
  video: Video,
  procedure: ShieldCheck,
  system_access: KeyRound,
  approval: ShieldCheck,
  milestone: PlayCircle,
};

export function TaskCard({ task, onClick, compact = false, className }: TaskCardProps) {
  const Icon = TYPE_ICON[task.type];
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={cx(
        'flex items-start gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm',
        onClick && 'cursor-pointer hover:border-primary-200',
        compact && 'p-3',
        className,
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-ink-800">{task.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} strokeWidth={1.75} />
            {task.dueDate}
          </span>
          {task.ownerName && (
            <span className="inline-flex items-center gap-1">
              <Clock size={13} strokeWidth={1.75} />
              {task.ownerName}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
    </div>
  );
}
