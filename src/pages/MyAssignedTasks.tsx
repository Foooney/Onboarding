import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CheckSquare, MessageSquare, Square } from 'lucide-react';
import type { JourneyTaskPair } from '../lib/selectors';
import { effectiveStatus, getTasksOwnedBy } from '../lib/selectors';
import { useApp } from '../lib/store';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Table, type TableColumn } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DatePicker } from '../components/ui/DatePicker';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDisplayDate, daysBetween } from '../lib/status';
import { buttonClasses } from '../lib/utils';

type TabKey = 'open' | 'overdue' | 'upcoming';

function keyOf(pair: JourneyTaskPair): string {
  return `${pair.journey.id}:${pair.task.id}`;
}

export function MyAssignedTasks() {
  const { journeys, people, currentUser, setTaskStatus, rescheduleTask, addComment } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('open');
  const [reschedulingKey, setReschedulingKey] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [commentingKey, setCommentingKey] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  const owned = getTasksOwnedBy(journeys, currentUser.id);
  const open = owned.filter((p) => !['completed', 'cancelled'].includes(effectiveStatus(p.task)));
  const overdue = owned.filter((p) => effectiveStatus(p.task) === 'overdue');
  const upcoming = owned.filter((p) => {
    const status = effectiveStatus(p.task);
    if (status === 'completed' || status === 'cancelled' || status === 'overdue') return false;
    return daysBetween(p.task.dueDate) >= 0;
  });

  const rows = activeTab === 'open' ? open : activeTab === 'overdue' ? overdue : upcoming;
  const reschedulingPair = reschedulingKey ? owned.find((p) => keyOf(p) === reschedulingKey) : undefined;
  const commentingPair = commentingKey ? owned.find((p) => keyOf(p) === commentingKey) : undefined;

  function ownerName(id: string): string {
    const person = people.find((p) => p.id === id);
    return person ? `${person.firstName} ${person.lastName}` : 'Unknown';
  }

  function toggleComplete(pair: JourneyTaskPair) {
    const nextStatus = pair.task.status === 'completed' ? 'not_started' : 'completed';
    setTaskStatus(pair.journey.id, pair.task.id, nextStatus);
    showToast(nextStatus === 'completed' ? `Marked "${pair.task.title}" as completed.` : `Reopened "${pair.task.title}".`, 'success');
  }

  const columns: TableColumn<JourneyTaskPair>[] = [
    {
      key: 'done',
      header: '',
      width: '36px',
      render: (pair) => (
        <button type="button" onClick={() => toggleComplete(pair)} aria-label="Toggle completed" className="text-primary-600">
          {pair.task.status === 'completed' ? <CheckSquare size={18} strokeWidth={1.75} /> : <Square size={18} strokeWidth={1.75} className="text-ink-300" />}
        </button>
      ),
    },
    {
      key: 'task',
      header: 'Task',
      sortValue: (p) => p.task.title,
      render: (pair) => <p className="font-medium text-ink-800">{pair.task.title}</p>,
    },
    {
      key: 'employee',
      header: 'For',
      sortValue: (p) => `${p.journey.employee.firstName} ${p.journey.employee.lastName}`,
      render: (pair) => (
        <div className="flex items-center gap-2">
          <Avatar firstName={pair.journey.employee.firstName} lastName={pair.journey.employee.lastName} color={pair.journey.employee.avatarColor} size="sm" />
          <span className="text-body-sm text-ink-700">{pair.journey.employee.firstName} {pair.journey.employee.lastName}</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due date',
      sortValue: (p) => p.task.dueDate,
      render: (pair) => (
        <button
          type="button"
          onClick={() => {
            setReschedulingKey(keyOf(pair));
            setRescheduleDate(pair.task.dueDate);
          }}
          className="text-ink-700 underline decoration-dotted underline-offset-4 hover:text-primary-700"
        >
          {formatDisplayDate(pair.task.dueDate)}
        </button>
      ),
    },
    { key: 'priority', header: 'Priority', render: (pair) => <PriorityBadge priority={pair.task.priority} /> },
    { key: 'status', header: 'Status', render: (pair) => <StatusBadge status={effectiveStatus(pair.task)} /> },
    {
      key: 'actions',
      header: '',
      width: '90px',
      render: (pair) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setCommentingKey(keyOf(pair))}
            aria-label="Comments"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-surface-100 hover:text-ink-600"
          >
            <MessageSquare size={16} strokeWidth={1.75} />
            {pair.task.comments.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-white">
                {pair.task.comments.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/journeys/${pair.journey.id}`)}
            aria-label="Open journey"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-surface-100 hover:text-ink-600"
          >
            <ArrowUpRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-display text-ink-800">My Assigned Tasks</h1>
        <p className="mt-1 text-body text-ink-500">Everything owned by {currentUser.firstName} {currentUser.lastName}, across every journey.</p>
      </div>

      <Tabs
        tabs={[
          { key: 'open', label: 'Open', count: open.length },
          { key: 'overdue', label: 'Overdue', count: overdue.length },
          { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
        ]}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {rows.length === 0 ? (
        <EmptyState title="Nothing here" description="You're all caught up in this view." />
      ) : (
        <Card padding="none">
          <Table columns={columns} rows={rows} getRowId={keyOf} />
        </Card>
      )}

      <Modal
        open={reschedulingPair !== undefined}
        onClose={() => setReschedulingKey(null)}
        title="Reschedule task"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setReschedulingKey(null)} className={buttonClasses('secondary')}>Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (!reschedulingPair) return;
                rescheduleTask(reschedulingPair.journey.id, reschedulingPair.task.id, rescheduleDate);
                showToast(`Rescheduled "${reschedulingPair.task.title}" to ${formatDisplayDate(rescheduleDate)}.`, 'success');
                setReschedulingKey(null);
              }}
              className={buttonClasses('primary')}
            >
              Save
            </button>
          </>
        }
      >
        {reschedulingPair && (
          <div className="flex flex-col gap-3">
            <p className="text-body-sm text-ink-500">{reschedulingPair.task.title}</p>
            <DatePicker label="New due date" value={rescheduleDate} onChange={setRescheduleDate} />
          </div>
        )}
      </Modal>

      <Modal open={commentingPair !== undefined} onClose={() => setCommentingKey(null)} title="Comments" size="sm">
        {commentingPair && (
          <div className="flex flex-col gap-4">
            <p className="text-body-sm font-medium text-ink-700">{commentingPair.task.title}</p>
            <div className="flex flex-col gap-3">
              {commentingPair.task.comments.length === 0 && <p className="text-body-sm text-ink-400">No comments yet.</p>}
              {commentingPair.task.comments.map((comment) => (
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
                  if (!commentDraft.trim() || !commentingPair) return;
                  addComment(commentingPair.journey.id, commentingPair.task.id, commentDraft.trim());
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
    </div>
  );
}
