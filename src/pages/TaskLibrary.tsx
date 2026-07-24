import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Archive, ArchiveRestore, Copy, LayoutGrid, List, Pencil, Plus, Sparkles } from 'lucide-react';
import type { DefaultOwnerRole, Department, Phase, Priority, TaskCategory, TaskTemplate, TaskType } from '../types';
import { useApp, usePeople, useTaskLibrary } from '../lib/store';
import { useToast } from '../components/ui/Toast';
import { Card } from '../components/ui/Card';
import { Table, type TableColumn } from '../components/ui/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterBar } from '../components/ui/FilterBar';
import { Modal } from '../components/ui/Modal';
import { Badge, PriorityBadge } from '../components/ui/Badge';
import { Dropdown, type DropdownItem } from '../components/ui/Dropdown';
import { EmptyState } from '../components/ui/EmptyState';
import { PHASE_LABEL, PHASE_ORDER } from '../lib/phases';
import { INPUT_CLASSES, SELECT_CLASSES, buttonClasses, cx, formatEnumLabel } from '../lib/utils';

const CATEGORIES: TaskCategory[] = [
  'welcome_admin', 'team_org', 'it_tools', 'compliance', 'finance_processes', 'smart_infrastructure',
  'product_portfolio', 'systems_reporting', 'meetings_networking', 'training', 'documents_procedures',
  'first_30', 'first_60', 'first_90',
];
const TYPES: TaskType[] = ['task', 'meeting', 'training', 'reading', 'video', 'procedure', 'system_access', 'approval', 'milestone'];
const OWNER_ROLES: DefaultOwnerRole[] = ['manager', 'buddy', 'hr', 'it', 'team_lead', 'trainer', 'process_owner', 'finance', 'new_joiner'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
const DEPARTMENTS: Department[] = [
  'Finance', 'Controlling', 'Digitalization', 'Performance Management', 'Project Management',
  'Business Administration', 'Smart Infrastructure', 'Electrification', 'Buildings', 'Operations',
];

interface TaskFormValues {
  title: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  estimatedDuration: string;
  defaultOwnerRole: DefaultOwnerRole;
  recommendedPhase: Phase;
  priority: Priority;
  tags: string;
  resourceUrl: string;
  resourceLabel: string;
}

const emptyForm: TaskFormValues = {
  title: '',
  description: '',
  category: 'welcome_admin',
  type: 'task',
  estimatedDuration: '30 min',
  defaultOwnerRole: 'manager',
  recommendedPhase: 'first_week',
  priority: 'medium',
  tags: '',
  resourceUrl: '',
  resourceLabel: '',
};

function templateToForm(t: TaskTemplate): TaskFormValues {
  return {
    title: t.title,
    description: t.description,
    category: t.category,
    type: t.type,
    estimatedDuration: t.estimatedDuration,
    defaultOwnerRole: t.defaultOwnerRole,
    recommendedPhase: t.recommendedPhase,
    priority: t.priority,
    tags: t.tags.join(', '),
    resourceUrl: t.resourceUrl ?? '',
    resourceLabel: t.resourceLabel ?? '',
  };
}

export function TaskLibrary() {
  const taskLibrary = useTaskLibrary();
  const people = usePeople();
  const { createTaskTemplate, updateTaskTemplate, duplicateTaskTemplate, archiveTaskTemplate, createOnboardingTemplate } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState(() => (location.state as { initialSearch?: string } | null)?.initialSearch ?? '');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; templateId?: string } | null>(null);
  const [formValues, setFormValues] = useState<TaskFormValues>(emptyForm);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', team: DEPARTMENTS[0], durationDays: 90, ownerId: people[0]?.id ?? '' });

  const filtered = taskLibrary.filter((t) => {
    if (statusFilter === 'active' && t.archived) return false;
    if (statusFilter === 'archived' && !t.archived) return false;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || t.title.toLowerCase().includes(query) || t.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesType && matchesPriority;
  });

  const activeFilterCount = [categoryFilter, typeFilter, priorityFilter].filter((v) => v !== 'all').length + (statusFilter !== 'active' ? 1 : 0);

  function clearFilters() {
    setCategoryFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setStatusFilter('active');
    setSearch('');
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreate() {
    setFormValues(emptyForm);
    setFormState({ mode: 'create' });
  }

  function openEdit(template: TaskTemplate) {
    setFormValues(templateToForm(template));
    setFormState({ mode: 'edit', templateId: template.id });
  }

  function saveForm() {
    if (!formValues.title.trim()) return;
    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      category: formValues.category,
      type: formValues.type,
      estimatedDuration: formValues.estimatedDuration.trim(),
      defaultOwnerRole: formValues.defaultOwnerRole,
      recommendedPhase: formValues.recommendedPhase,
      priority: formValues.priority,
      tags: formValues.tags.split(',').map((t) => t.trim()).filter(Boolean),
      resourceUrl: formValues.resourceUrl.trim() || undefined,
      resourceLabel: formValues.resourceLabel.trim() || undefined,
    };
    if (formState?.mode === 'edit' && formState.templateId) {
      updateTaskTemplate(formState.templateId, payload);
      showToast(`Updated "${payload.title}".`, 'success');
    } else {
      createTaskTemplate(payload);
      showToast(`Created "${payload.title}".`, 'success');
    }
    setFormState(null);
  }

  function handleDuplicate(template: TaskTemplate) {
    duplicateTaskTemplate(template.id);
    showToast(`Duplicated "${template.title}".`, 'success');
  }

  function handleArchiveToggle(template: TaskTemplate) {
    archiveTaskTemplate(template.id, !template.archived);
    showToast(template.archived ? `Restored "${template.title}".` : `Archived "${template.title}".`, 'info');
  }

  function actionsFor(template: TaskTemplate): DropdownItem[] {
    return [
      { key: 'edit', label: 'Edit', icon: Pencil, onSelect: () => openEdit(template) },
      { key: 'duplicate', label: 'Duplicate', icon: Copy, onSelect: () => handleDuplicate(template) },
      {
        key: 'archive',
        label: template.archived ? 'Restore' : 'Archive',
        icon: template.archived ? ArchiveRestore : Archive,
        onSelect: () => handleArchiveToggle(template),
      },
    ];
  }

  function createTemplateFromSelection() {
    if (selectedIds.size === 0 || !templateForm.name.trim()) return;
    const id = createOnboardingTemplate({
      name: templateForm.name.trim(),
      description: templateForm.description.trim(),
      team: templateForm.team,
      durationDays: templateForm.durationDays,
      taskTemplateIds: [...selectedIds],
      ownerId: templateForm.ownerId,
    });
    showToast(`Created template "${templateForm.name}" with ${selectedIds.size} tasks.`, 'success');
    setSelectedIds(new Set());
    setTemplateModalOpen(false);
    setTemplateForm({ name: '', description: '', team: DEPARTMENTS[0], durationDays: 90, ownerId: people[0]?.id ?? '' });
    navigate(`/templates?highlight=${id}`);
  }

  const columns: TableColumn<TaskTemplate>[] = [
    {
      key: 'select',
      header: '',
      width: '32px',
      render: (t) => <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelected(t.id)} className="h-4 w-4 accent-primary-600" />,
    },
    {
      key: 'title',
      header: 'Task',
      sortValue: (t) => t.title,
      render: (t) => (
        <div>
          <p className="font-medium text-ink-800">{t.title}</p>
          {t.tags.length > 0 && <p className="mt-0.5 text-body-sm text-ink-400">{t.tags.join(' · ')}</p>}
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortValue: (t) => t.category, render: (t) => formatEnumLabel(t.category) },
    { key: 'type', header: 'Type', sortValue: (t) => t.type, render: (t) => formatEnumLabel(t.type) },
    { key: 'priority', header: 'Priority', render: (t) => <PriorityBadge priority={t.priority} /> },
    { key: 'duration', header: 'Duration', render: (t) => t.estimatedDuration },
    { key: 'status', header: '', render: (t) => (t.archived ? <Badge label="Archived" tone="neutral" /> : null) },
    { key: 'actions', header: '', width: '48px', render: (t) => <Dropdown align="right" trigger={<span className="px-2 text-ink-400 hover:text-ink-700">⋯</span>} items={actionsFor(t)} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-ink-800">Task Library</h1>
          <p className="mt-1 text-body text-ink-500">{filtered.length} of {taskLibrary.length} task templates</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button type="button" onClick={() => setTemplateModalOpen(true)} className={buttonClasses('secondary')}>
              <Sparkles size={16} strokeWidth={1.75} />
              Create template ({selectedIds.size})
            </button>
          )}
          <button type="button" onClick={openCreate} className={buttonClasses('primary')}>
            <Plus size={16} strokeWidth={2} />
            Create task
          </button>
        </div>
      </div>

      <FilterBar activeFilterCount={activeFilterCount} onClearAll={clearFilters}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks or tags…" className="w-64" />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')} className={SELECT_CLASSES}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{formatEnumLabel(c)}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TaskType | 'all')} className={SELECT_CLASSES}>
          <option value="all">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{formatEnumLabel(t)}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')} className={SELECT_CLASSES}>
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{formatEnumLabel(p)}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={SELECT_CLASSES}>
          <option value="active">Active only</option>
          <option value="archived">Archived only</option>
          <option value="all">All</option>
        </select>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-surface-200 p-1">
          <button type="button" onClick={() => setView('table')} aria-label="Table view" className={cx('rounded-md p-1.5', view === 'table' ? 'bg-primary-50 text-primary-700' : 'text-ink-400 hover:text-ink-600')}>
            <List size={16} strokeWidth={1.75} />
          </button>
          <button type="button" onClick={() => setView('grid')} aria-label="Grid view" className={cx('rounded-md p-1.5', view === 'grid' ? 'bg-primary-50 text-primary-700' : 'text-ink-400 hover:text-ink-600')}>
            <LayoutGrid size={16} strokeWidth={1.75} />
          </button>
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No tasks match" description="Try a different search or clear your filters." action={{ label: 'Clear filters', onClick: clearFilters }} />
      ) : view === 'table' ? (
        <Card padding="none">
          <Table columns={columns} rows={filtered} getRowId={(t) => t.id} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className={cx(t.archived && 'opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelected(t.id)} className="mt-1 h-4 w-4 accent-primary-600" />
                <Dropdown align="right" trigger={<span className="px-1 text-ink-400 hover:text-ink-700">⋯</span>} items={actionsFor(t)} />
              </div>
              <p className="mt-1 font-medium text-ink-800">{t.title}</p>
              <p className="mt-1 line-clamp-2 text-body-sm text-ink-500">{t.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge label={formatEnumLabel(t.category)} tone="neutral" />
                <PriorityBadge priority={t.priority} />
                {t.archived && <Badge label="Archived" tone="neutral" />}
              </div>
              <p className="mt-3 text-body-sm text-ink-400">{formatEnumLabel(t.type)} · {t.estimatedDuration} · {PHASE_LABEL[t.recommendedPhase]}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={formState !== null}
        onClose={() => setFormState(null)}
        title={formState?.mode === 'edit' ? 'Edit task' : 'Create task'}
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setFormState(null)} className={buttonClasses('secondary')}>Cancel</button>
            <button type="button" onClick={saveForm} className={buttonClasses('primary')}>Save</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Title</span>
            <input className={INPUT_CLASSES} value={formValues.title} onChange={(e) => setFormValues((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Description</span>
            <textarea className={INPUT_CLASSES} rows={2} value={formValues.description} onChange={(e) => setFormValues((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Category</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={formValues.category} onChange={(e) => setFormValues((f) => ({ ...f, category: e.target.value as TaskCategory }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{formatEnumLabel(c)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Type</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={formValues.type} onChange={(e) => setFormValues((f) => ({ ...f, type: e.target.value as TaskType }))}>
                {TYPES.map((t) => <option key={t} value={t}>{formatEnumLabel(t)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Phase</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={formValues.recommendedPhase} onChange={(e) => setFormValues((f) => ({ ...f, recommendedPhase: e.target.value as Phase }))}>
                {PHASE_ORDER.map((p) => <option key={p} value={p}>{PHASE_LABEL[p]}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Priority</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={formValues.priority} onChange={(e) => setFormValues((f) => ({ ...f, priority: e.target.value as Priority }))}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{formatEnumLabel(p)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Default owner</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={formValues.defaultOwnerRole} onChange={(e) => setFormValues((f) => ({ ...f, defaultOwnerRole: e.target.value as DefaultOwnerRole }))}>
                {OWNER_ROLES.map((r) => <option key={r} value={r}>{formatEnumLabel(r)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Estimated duration</span>
              <input className={INPUT_CLASSES} value={formValues.estimatedDuration} onChange={(e) => setFormValues((f) => ({ ...f, estimatedDuration: e.target.value }))} placeholder="e.g. 30 min" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Tags (comma-separated)</span>
            <input className={INPUT_CLASSES} value={formValues.tags} onChange={(e) => setFormValues((f) => ({ ...f, tags: e.target.value }))} placeholder="e.g. compliance, mandatory" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Resource label (optional)</span>
              <input className={INPUT_CLASSES} value={formValues.resourceLabel} onChange={(e) => setFormValues((f) => ({ ...f, resourceLabel: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Resource URL (optional)</span>
              <input className={INPUT_CLASSES} value={formValues.resourceUrl} onChange={(e) => setFormValues((f) => ({ ...f, resourceUrl: e.target.value }))} />
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="Create template from selection"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setTemplateModalOpen(false)} className={buttonClasses('secondary')}>Cancel</button>
            <button type="button" onClick={createTemplateFromSelection} className={buttonClasses('primary')}>Create template</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-ink-500">{selectedIds.size} tasks selected.</p>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Name</span>
            <input className={INPUT_CLASSES} value={templateForm.name} onChange={(e) => setTemplateForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Description</span>
            <textarea className={INPUT_CLASSES} rows={2} value={templateForm.description} onChange={(e) => setTemplateForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Department</span>
            <select className={cx(SELECT_CLASSES, 'w-full')} value={templateForm.team} onChange={(e) => setTemplateForm((f) => ({ ...f, team: e.target.value as Department }))}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Duration (days)</span>
            <input type="number" className={INPUT_CLASSES} value={templateForm.durationDays} onChange={(e) => setTemplateForm((f) => ({ ...f, durationDays: Number(e.target.value) }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Owner</span>
            <select className={cx(SELECT_CLASSES, 'w-full')} value={templateForm.ownerId} onChange={(e) => setTemplateForm((f) => ({ ...f, ownerId: e.target.value }))}>
              {people.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}
