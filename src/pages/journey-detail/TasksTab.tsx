import { useState } from 'react';
import { CheckSquare, MessageSquare, Plus, Square, Trash2 } from 'lucide-react';
import type { Journey, JourneyTask, TaskStatus } from '../../types';
import { useApp } from '../../lib/store';
import { effectiveStatus } from '../../lib/selectors';
import { addDays, formatDate, formatDisplayDate, today } from '../../lib/status';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Table, type TableColumn } from '../../components/ui/Table';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DatePicker } from '../../components/ui/DatePicker';
import { buttonClasses, cx, formatEnumLabel } from '../../lib/utils';

export interface TasksTabProps {
  journey: Journey;
}

const SELECT_CLASSES =
  'rounded-lg border border-surface-200 bg-white px-2.5 py-1.5 text-body-sm text-ink-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100';

const EDITABLE_STATUSES: TaskStatus[] = ['not_started', 'planned', 'in_progress', 'blocked', 'completed', 'cancelled'];

export function TasksTab({ journey }: TasksTabProps) {
  const { people, taskLibrary, setTaskStatus, removeTask, rescheduleTask, addTask, addComment } = useApp();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  // Always read the live task from the journey — these ids just track which
  // row a modal is open for, so edits (e.g. a freshly posted comment) show up
  // immediately instead of freezing on a stale snapshot taken at click time.
  const rescheduling = reschedulingId ? journey.tasks.find((t) => t.id === reschedulingId) ?? null : null;
  const deleting = deletingId ? journey.tasks.find((t) => t.id === deletingId) ?? null : null;
  const commenting = commentingId ? journey.tasks.find((t) => t.id === commentingId) ?? null : null;

  const filteredTasks = journey.tasks.filter((task) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || task.title.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || effectiveStatus(task) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function ownerName(id: string): string {
    const person = people.find((p) => p.id === id);
    return person ? `${person.firstName} ${person.lastName}` : 'Unassigned';
  }

  function toggleComplete(task: JourneyTask) {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'not_started' : 'completed';
    setTaskStatus(journey.id, task.id, nextStatus);
    showToast(nextStatus === 'completed' ? `Marked "${task.title}" as completed.` : `Reopened "${task.title}".`, 'success');
  }

  const columns: TableColumn<JourneyTask>[] = [
    {
      key: 'done',
      header: '',
      width: '36px',
      render: (task) => (
        <button type="button" onClick={() => toggleComplete(task)} aria-label="Toggle completed" className="text-primary-600">
          {task.status === 'completed' ? <CheckSquare size={18} strokeWidth={1.75} /> : <Square size={18} strokeWidth={1.75} className="text-ink-300" />}
        </button>
      ),
    },
    {
      key: 'task',
      header: 'Task',
      sortValue: (task) => task.title,
      render: (task) => (
        <div>
          <p className={cx('font-medium text-ink-800', task.status === 'completed' && 'text-ink-400 line-through')}>{task.title}</p>
          <p className="text-body-sm text-ink-400">{formatEnumLabel(task.category)} · {formatEnumLabel(task.type)}</p>
        </div>
      ),
    },
    { key: 'owner', header: 'Owner', sortValue: (task) => ownerName(task.ownerId), render: (task) => ownerName(task.ownerId) },
    {
      key: 'dueDate',
      header: 'Due date',
      sortValue: (task) => task.dueDate,
      render: (task) => (
        <button
          type="button"
          onClick={() => {
            setReschedulingId(task.id);
            setRescheduleDate(task.dueDate);
          }}
          className="text-ink-700 underline decoration-dotted underline-offset-4 hover:text-primary-700"
        >
          {formatDisplayDate(task.dueDate)}
        </button>
      ),
    },
    { key: 'priority', header: 'Priority', render: (task) => <PriorityBadge priority={task.priority} /> },
    {
      key: 'status',
      header: 'Status',
      render: (task) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={effectiveStatus(task)} />
          <select
            value={task.status}
            onChange={(e) => setTaskStatus(journey.id, task.id, e.target.value as TaskStatus)}
            className={SELECT_CLASSES}
            aria-label={`Change status for ${task.title}`}
          >
            {EDITABLE_STATUSES.map((status) => (
              <option key={status} value={status}>{formatEnumLabel(status)}</option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '90px',
      render: (task) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setCommentingId(task.id)}
            aria-label="Comments"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-surface-100 hover:text-ink-600"
          >
            <MessageSquare size={16} strokeWidth={1.75} />
            {task.comments.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-white">
                {task.comments.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setDeletingId(task.id)}
            aria-label="Delete task"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-danger-50 hover:text-danger-700"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  const availableTemplates = taskLibrary.filter(
    (t) => !t.archived && !journey.tasks.some((jt) => jt.templateId === t.id) && (!addSearch.trim() || t.title.toLowerCase().includes(addSearch.trim().toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks…" className="w-64" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')} className={SELECT_CLASSES}>
          <option value="all">All statuses</option>
          {(['not_started', 'planned', 'in_progress', 'completed', 'overdue', 'blocked', 'cancelled'] as TaskStatus[]).map((status) => (
            <option key={status} value={status}>{formatEnumLabel(status)}</option>
          ))}
        </select>
        <button type="button" onClick={() => setAddModalOpen(true)} className={cx(buttonClasses('primary'), 'ml-auto')}>
          <Plus size={16} strokeWidth={2} />
          Add task from library
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState title="No tasks match" description="Try a different search or status filter." />
      ) : (
        <Card padding="none">
          <Table columns={columns} rows={filteredTasks} getRowId={(t) => t.id} />
        </Card>
      )}

      <Modal open={rescheduling !== null} onClose={() => setReschedulingId(null)} title="Reschedule task" size="sm"
        footer={
          <>
            <button type="button" onClick={() => setReschedulingId(null)} className={buttonClasses('secondary')}>Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (!rescheduling) return;
                rescheduleTask(journey.id, rescheduling.id, rescheduleDate);
                showToast(`Rescheduled "${rescheduling.title}" to ${formatDisplayDate(rescheduleDate)}.`, 'success');
                setReschedulingId(null);
              }}
              className={buttonClasses('primary')}
            >
              Save
            </button>
          </>
        }
      >
        {rescheduling && (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-ink-500">{rescheduling.title}</p>
            <DatePicker label="New due date" value={rescheduleDate} onChange={setRescheduleDate} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (!deleting) return;
          removeTask(journey.id, deleting.id);
          showToast(`Removed "${deleting.title}".`, 'info');
        }}
        title="Remove this task?"
        description={deleting ? `"${deleting.title}" will be removed from this journey. This can't be undone.` : ''}
        confirmLabel="Remove task"
        tone="danger"
      />

      <Modal open={commenting !== null} onClose={() => setCommentingId(null)} title="Comments" size="sm">
        {commenting && (
          <div className="flex flex-col gap-4">
            <p className="text-body-sm font-medium text-ink-700">{commenting.title}</p>
            <div className="flex flex-col gap-3">
              {commenting.comments.length === 0 && <p className="text-body-sm text-ink-400">No comments yet.</p>}
              {commenting.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-surface-50 p-3">
                  <p className="text-body-sm font-medium text-ink-700">{ownerName(comment.authorId)}</p>
                  <p className="mt-1 text-body-sm text-ink-600">{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 rounded-lg border border-surface-200 px-3 py-2 text-body-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="button"
                onClick={() => {
                  if (!commentDraft.trim() || !commenting) return;
                  addComment(journey.id, commenting.id, commentDraft.trim());
                  setCommentDraft('');
                  showToast('Comment added.', 'success');
                }}
                className={buttonClasses('primary')}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add task from library" size="lg">
        <div className="flex flex-col gap-4">
          <SearchInput value={addSearch} onChange={setAddSearch} placeholder="Search the task library…" />
          <div className="flex max-h-96 flex-col divide-y divide-surface-100 overflow-y-auto">
            {availableTemplates.length === 0 && <p className="py-4 text-body-sm text-ink-400">No matching templates — everything from the library is already in this journey.</p>}
            {availableTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-body font-medium text-ink-800">{template.title}</p>
                  <p className="text-body-sm text-ink-400">{formatEnumLabel(template.category)} · {formatEnumLabel(template.type)} · {template.estimatedDuration}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addTask(journey.id, {
                      templateId: template.id,
                      title: template.title,
                      description: template.description,
                      category: template.category,
                      type: template.type,
                      phase: template.recommendedPhase,
                      ownerId: journey.managerId,
                      dueDate: addDays(formatDate(today()), 7),
                      priority: template.priority,
                      mandatory: template.priority !== 'low',
                    });
                    showToast(`Added "${template.title}" to the journey.`, 'success');
                  }}
                  className={buttonClasses('secondary')}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
