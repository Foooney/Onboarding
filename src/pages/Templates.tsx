import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Eye, Pencil, Plus, Rocket } from 'lucide-react';
import type { Department, Id, OnboardingTemplate, TemplateStatus } from '../types';
import { useApp, usePeople, useTaskLibrary, useTemplates } from '../lib/store';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Table, type TableColumn } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Dropdown, type DropdownItem } from '../components/ui/Dropdown';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { formatDisplayDate } from '../lib/status';
import { personName as personNameOf } from '../lib/selectors';
import { INPUT_CLASSES, SELECT_CLASSES, buttonClasses, cx, formatEnumLabel } from '../lib/utils';

const DEPARTMENTS: Department[] = [
  'Finance', 'Controlling', 'Digitalization', 'Performance Management', 'Project Management',
  'Business Administration', 'Smart Infrastructure', 'Electrification', 'Buildings', 'Operations',
];

const STATUS_TONE: Record<TemplateStatus, 'neutral' | 'success' | 'warning'> = {
  draft: 'warning',
  active: 'success',
  archived: 'neutral',
};

interface TemplateFormValues {
  name: string;
  description: string;
  team: Department;
  durationDays: number;
  ownerId: Id;
  status: TemplateStatus;
}

function emptyForm(defaultOwner: Id): TemplateFormValues {
  return { name: '', description: '', team: DEPARTMENTS[0], durationDays: 90, ownerId: defaultOwner, status: 'draft' };
}

export function Templates() {
  const templates = useTemplates();
  const taskLibrary = useTaskLibrary();
  const people = usePeople();
  const { createOnboardingTemplate, updateOnboardingTemplate, duplicateOnboardingTemplate } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [viewing, setViewing] = useState<OnboardingTemplate | null>(null);
  const [editing, setEditing] = useState<OnboardingTemplate | null>(null);
  const [editForm, setEditForm] = useState<TemplateFormValues>(emptyForm(people[0]?.id ?? ''));

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TemplateFormValues>(emptyForm(people[0]?.id ?? ''));
  const [createSearch, setCreateSearch] = useState('');
  const [createSelectedIds, setCreateSelectedIds] = useState<Set<string>>(new Set());

  function taskCount(t: OnboardingTemplate) {
    return t.taskTemplateIds.length;
  }

  function openEdit(t: OnboardingTemplate) {
    setEditForm({ name: t.name, description: t.description, team: t.team, durationDays: t.durationDays, ownerId: t.ownerId, status: t.status });
    setEditing(t);
  }

  function saveEdit() {
    if (!editing || !editForm.name.trim()) return;
    updateOnboardingTemplate(editing.id, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      team: editForm.team,
      durationDays: editForm.durationDays,
      ownerId: editForm.ownerId,
      status: editForm.status,
    });
    showToast(`Updated "${editForm.name}".`, 'success');
    setEditing(null);
  }

  function handleDuplicate(t: OnboardingTemplate) {
    duplicateOnboardingTemplate(t.id);
    showToast(`Duplicated "${t.name}".`, 'success');
  }

  function useTemplate(t: OnboardingTemplate) {
    navigate('/journeys/new', { state: { initialTemplateId: t.id } });
  }

  function openCreate() {
    setCreateForm(emptyForm(people[0]?.id ?? ''));
    setCreateSearch('');
    setCreateSelectedIds(new Set());
    setCreateOpen(true);
  }

  function toggleCreateTask(id: string) {
    setCreateSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submitCreate() {
    if (!createForm.name.trim()) return;
    const id = createOnboardingTemplate({
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      team: createForm.team,
      durationDays: createForm.durationDays,
      ownerId: createForm.ownerId,
      status: createForm.status,
      taskTemplateIds: [...createSelectedIds],
    });
    showToast(`Created template "${createForm.name}".`, 'success');
    setCreateOpen(false);
    navigate(`/templates?highlight=${id}`);
  }

  function actionsFor(t: OnboardingTemplate): DropdownItem[] {
    return [
      { key: 'open', label: 'Open', icon: Eye, onSelect: () => setViewing(t) },
      { key: 'edit', label: 'Edit', icon: Pencil, onSelect: () => openEdit(t) },
      { key: 'duplicate', label: 'Duplicate', icon: Copy, onSelect: () => handleDuplicate(t) },
      { key: 'use', label: 'Use template', icon: Rocket, onSelect: () => useTemplate(t) },
    ];
  }

  const columns: TableColumn<OnboardingTemplate>[] = [
    {
      key: 'name',
      header: 'Template',
      sortValue: (t) => t.name,
      render: (t) => (
        <div>
          <p className="font-medium text-ink-800">{t.name}</p>
          <p className="mt-0.5 line-clamp-1 text-body-sm text-ink-400">{t.description}</p>
        </div>
      ),
    },
    { key: 'team', header: 'Department', sortValue: (t) => t.team, render: (t) => t.team },
    { key: 'duration', header: 'Duration', sortValue: (t) => t.durationDays, render: (t) => `${t.durationDays} days` },
    { key: 'tasks', header: 'Tasks', sortValue: (t) => taskCount(t), render: (t) => taskCount(t) },
    { key: 'updatedAt', header: 'Updated', sortValue: (t) => t.updatedAt, render: (t) => formatDisplayDate(t.updatedAt) },
    { key: 'owner', header: 'Owner', sortValue: (t) => personNameOf(people, t.ownerId), render: (t) => personNameOf(people, t.ownerId) },
    { key: 'status', header: 'Status', render: (t) => <Badge label={formatEnumLabel(t.status)} tone={STATUS_TONE[t.status]} /> },
    { key: 'actions', header: '', width: '48px', render: (t) => <Dropdown align="right" trigger={<span className="px-2 text-ink-400 hover:text-ink-700">⋯</span>} items={actionsFor(t)} /> },
  ];

  const createLibrary = taskLibrary.filter(
    (t) => !t.archived && (!createSearch.trim() || t.title.toLowerCase().includes(createSearch.trim().toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-ink-800">Templates</h1>
          <p className="mt-1 text-body text-ink-500">{templates.length} onboarding templates</p>
        </div>
        <button type="button" onClick={openCreate} className={buttonClasses('primary')}>
          <Plus size={16} strokeWidth={2} />
          Create template
        </button>
      </div>

      <Card padding="none">
        <Table columns={columns} rows={templates} getRowId={(t) => t.id} />
      </Card>
      {highlightId && (
        <p className="text-body-sm text-primary-700">Just created — look for it highlighted in the table above.</p>
      )}

      {/* View modal */}
      <Modal open={viewing !== null} onClose={() => setViewing(null)} title={viewing?.name ?? ''} size="lg">
        {viewing && (
          <div className="flex flex-col gap-4">
            <p className="text-body-sm text-ink-500">{viewing.description}</p>
            <div className="flex flex-wrap gap-4 text-body-sm text-ink-500">
              <span>{viewing.team}</span>
              <span>{viewing.durationDays} days</span>
              <span>{taskCount(viewing)} tasks</span>
              <span>Owned by {personNameOf(people, viewing.ownerId)}</span>
            </div>
            <div className="flex max-h-96 flex-col divide-y divide-surface-100 overflow-y-auto rounded-lg border border-surface-200">
              {viewing.taskTemplateIds.map((id) => {
                const task = taskLibrary.find((t) => t.id === id);
                if (!task) return null;
                return (
                  <div key={id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <p className="text-body-sm text-ink-700">{task.title}</p>
                    <span className="shrink-0 text-caption text-ink-400">{formatEnumLabel(task.category)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit template"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className={buttonClasses('secondary')}>Cancel</button>
            <button type="button" onClick={saveEdit} className={buttonClasses('primary')}>Save</button>
          </>
        }
      >
        <TemplateFormFields values={editForm} onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))} people={people} includeStatus />
      </Modal>

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create template"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setCreateOpen(false)} className={buttonClasses('secondary')}>Cancel</button>
            <button type="button" onClick={submitCreate} className={buttonClasses('primary')}>Create template</button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TemplateFormFields values={createForm} onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))} people={people} includeStatus={false} />
          <div className="flex flex-col gap-2">
            <span className="text-label text-ink-600">Tasks ({createSelectedIds.size} selected)</span>
            <SearchInput value={createSearch} onChange={setCreateSearch} placeholder="Search the task library…" />
            <div className="flex max-h-72 flex-col divide-y divide-surface-100 overflow-y-auto rounded-lg border border-surface-200">
              {createLibrary.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-surface-50">
                  <input type="checkbox" checked={createSelectedIds.has(t.id)} onChange={() => toggleCreateTask(t.id)} className="h-4 w-4 accent-primary-600" />
                  <span className="text-body-sm text-ink-700">{t.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TemplateFormFields({
  values,
  onChange,
  people,
  includeStatus,
}: {
  values: TemplateFormValues;
  onChange: (patch: Partial<TemplateFormValues>) => void;
  people: ReturnType<typeof usePeople>;
  includeStatus: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-ink-600">Name</span>
        <input className={INPUT_CLASSES} value={values.name} onChange={(e) => onChange({ name: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-ink-600">Description</span>
        <textarea className={INPUT_CLASSES} rows={3} value={values.description} onChange={(e) => onChange({ description: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-ink-600">Department</span>
        <select className={cx(SELECT_CLASSES, 'w-full')} value={values.team} onChange={(e) => onChange({ team: e.target.value as Department })}>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-ink-600">Duration (days)</span>
        <input type="number" className={INPUT_CLASSES} value={values.durationDays} onChange={(e) => onChange({ durationDays: Number(e.target.value) })} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-ink-600">Owner</span>
        <select className={cx(SELECT_CLASSES, 'w-full')} value={values.ownerId} onChange={(e) => onChange({ ownerId: e.target.value })}>
          {people.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
        </select>
      </label>
      {includeStatus && (
        <label className="flex flex-col gap-1.5">
          <span className="text-label text-ink-600">Status</span>
          <select className={cx(SELECT_CLASSES, 'w-full')} value={values.status} onChange={(e) => onChange({ status: e.target.value as TemplateStatus })}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      )}
    </div>
  );
}
