import { useState } from 'react';
import type { Priority } from '../../types';
import { usePeople } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Table, type TableColumn } from '../../components/ui/Table';
import { PHASE_LABEL } from '../../lib/phases';
import { SELECT_CLASSES, buttonClasses, cx, formatEnumLabel } from '../../lib/utils';
import type { DraftTask, WizardDraft } from './wizardTypes';

export interface StepAssignmentProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

const DATE_INPUT_CLASSES =
  'rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-body-sm text-ink-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100';

export function StepAssignment({ draft, onChange }: StepAssignmentProps) {
  const people = usePeople();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [bulkOwnerId, setBulkOwnerId] = useState('');
  const sortedPeople = [...people].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

  function updateTask(key: string, patch: Partial<DraftTask>) {
    onChange({ tasks: draft.tasks.map((t) => (t.key === key ? { ...t, ...patch } : t)) });
  }

  function toggleSelected(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function applyBulkOwner() {
    if (!bulkOwnerId || selectedKeys.size === 0) return;
    onChange({ tasks: draft.tasks.map((t) => (selectedKeys.has(t.key) ? { ...t, ownerId: bulkOwnerId } : t)) });
    setSelectedKeys(new Set());
    setBulkOwnerId('');
  }

  const columns: TableColumn<DraftTask>[] = [
    {
      key: 'select',
      header: '',
      width: '32px',
      render: (task) => (
        <input type="checkbox" checked={selectedKeys.has(task.key)} onChange={() => toggleSelected(task.key)} className="h-4 w-4 accent-primary-600" />
      ),
    },
    {
      key: 'task',
      header: 'Task',
      render: (task) => (
        <div>
          <p className="font-medium text-ink-800">{task.title}</p>
          <p className="text-body-sm text-ink-400">{PHASE_LABEL[task.phase]}</p>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (task) => (
        <select value={task.ownerId} onChange={(e) => updateTask(task.key, { ownerId: e.target.value })} className={SELECT_CLASSES}>
          <option value="" disabled>Select…</option>
          {sortedPeople.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      ),
    },
    {
      key: 'buddy',
      header: 'Buddy',
      render: (task) => (
        <select value={task.buddyId ?? ''} onChange={(e) => updateTask(task.key, { buddyId: e.target.value || undefined })} className={SELECT_CLASSES}>
          <option value="">None</option>
          {sortedPeople.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due date',
      render: (task) => (
        <input type="date" value={task.dueDate} onChange={(e) => updateTask(task.key, { dueDate: e.target.value })} className={DATE_INPUT_CLASSES} />
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (task) => (
        <select value={task.priority} onChange={(e) => updateTask(task.key, { priority: e.target.value as Priority })} className={SELECT_CLASSES}>
          {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => <option key={p} value={p}>{formatEnumLabel(p)}</option>)}
        </select>
      ),
    },
    {
      key: 'mandatory',
      header: 'Mandatory',
      render: (task) => (
        <input type="checkbox" checked={task.mandatory} onChange={(e) => updateTask(task.key, { mandatory: e.target.checked })} className="h-4 w-4 accent-primary-600" />
      ),
    },
    {
      key: 'dependsOn',
      header: 'Depends on',
      render: (task) => {
        const options = draft.tasks.filter((t) => t.key !== task.key);
        if (options.length === 0) return <span className="text-body-sm text-ink-300">—</span>;
        return (
          <select
            multiple
            size={Math.min(3, options.length)}
            value={task.dependsOn}
            onChange={(e) => updateTask(task.key, { dependsOn: Array.from(e.target.selectedOptions).map((o) => o.value) })}
            className={cx(SELECT_CLASSES, 'min-w-[10rem]')}
          >
            {options.map((o) => <option key={o.key} value={o.key}>{o.title}</option>)}
          </select>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-h3 text-ink-800">Assign owners and dates</h2>
        <p className="mt-1 text-body-sm text-ink-500">Fine-tune who owns each task, when it's due, and how tasks depend on each other.</p>
      </div>

      {selectedKeys.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-2.5">
          <span className="text-body-sm font-medium text-primary-700">{selectedKeys.size} selected</span>
          <select value={bulkOwnerId} onChange={(e) => setBulkOwnerId(e.target.value)} className={SELECT_CLASSES}>
            <option value="">Assign owner…</option>
            {sortedPeople.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </select>
          <button type="button" onClick={applyBulkOwner} className={buttonClasses('primary')} disabled={!bulkOwnerId}>
            Apply to selected
          </button>
        </div>
      )}

      <Card padding="none">
        <Table columns={columns} rows={draft.tasks} getRowId={(t) => t.key} />
      </Card>
    </div>
  );
}
