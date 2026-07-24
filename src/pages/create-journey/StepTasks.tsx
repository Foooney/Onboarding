import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Phase, Priority, TaskCategory, TaskType } from '../../types';
import { useTaskLibrary } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { PriorityBadge } from '../../components/ui/Badge';
import { INPUT_CLASSES, SELECT_CLASSES, buttonClasses, cx, formatEnumLabel, uniqueId } from '../../lib/utils';
import { PHASE_LABEL, PHASE_ORDER } from '../../lib/phases';
import { defaultDueDate, draftTaskFromTemplate, resolveDefaultOwner } from './draftHelpers';
import type { DraftTask, WizardDraft } from './wizardTypes';

export interface StepTasksProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

const CATEGORIES: TaskCategory[] = [
  'welcome_admin', 'team_org', 'it_tools', 'compliance', 'finance_processes', 'smart_infrastructure',
  'product_portfolio', 'systems_reporting', 'meetings_networking', 'training', 'documents_procedures',
  'first_30', 'first_60', 'first_90',
];

const TYPES: TaskType[] = ['task', 'meeting', 'training', 'reading', 'video', 'procedure', 'system_access', 'approval', 'milestone'];

const emptyCustomTask = { title: '', description: '', category: 'welcome_admin' as TaskCategory, type: 'task' as TaskType, phase: 'first_week' as Phase, priority: 'medium' as Priority };

export function StepTasks({ draft, onChange }: StepTasksProps) {
  const taskLibrary = useTaskLibrary();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customTask, setCustomTask] = useState(emptyCustomTask);

  const selectedTemplateIds = new Set(draft.tasks.map((t) => t.templateId).filter(Boolean));

  const visibleTemplates = taskLibrary.filter((t) => {
    if (t.archived) return false;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || t.title.toLowerCase().includes(query) || t.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function toggleTemplate(templateId: string) {
    if (selectedTemplateIds.has(templateId)) {
      onChange({ tasks: draft.tasks.filter((t) => t.templateId !== templateId) });
      return;
    }
    const template = taskLibrary.find((t) => t.id === templateId);
    if (!template) return;
    onChange({ tasks: [...draft.tasks, draftTaskFromTemplate(template, draft)] });
  }

  function removeTask(key: string) {
    onChange({ tasks: draft.tasks.filter((t) => t.key !== key) });
  }

  function addCustomTask() {
    if (!customTask.title.trim()) return;
    const newTask: DraftTask = {
      key: uniqueId('draft'),
      title: customTask.title.trim(),
      description: customTask.description.trim(),
      category: customTask.category,
      type: customTask.type,
      phase: customTask.phase,
      ownerId: resolveDefaultOwner('manager', draft),
      dueDate: defaultDueDate(draft.startDate, customTask.phase),
      priority: customTask.priority,
      mandatory: customTask.priority !== 'low',
      dependsOn: [],
    };
    onChange({ tasks: [...draft.tasks, newTask] });
    setCustomTask(emptyCustomTask);
    setCustomModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-h3 text-ink-800">Build the task list</h2>
        <p className="mt-1 text-body-sm text-ink-500">Pick from the library, or add a task of your own.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search the task library…" className="w-64" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | 'all')} className={SELECT_CLASSES}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{formatEnumLabel(c)}</option>)}
            </select>
          </div>
          <Card padding="none">
            <div className="flex max-h-[28rem] flex-col divide-y divide-surface-100 overflow-y-auto">
              {visibleTemplates.length === 0 && <p className="p-4 text-body-sm text-ink-400">No tasks match this search.</p>}
              {visibleTemplates.map((template) => {
                const checked = selectedTemplateIds.has(template.id);
                return (
                  <label key={template.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface-50">
                    <input type="checkbox" checked={checked} onChange={() => toggleTemplate(template.id)} className="mt-1 h-4 w-4 accent-primary-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-medium text-ink-800">{template.title}</p>
                      <p className="text-body-sm text-ink-400">{formatEnumLabel(template.category)} · {formatEnumLabel(template.type)} · {template.estimatedDuration}</p>
                    </div>
                    <PriorityBadge priority={template.priority} />
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-semibold text-ink-800">Added tasks ({draft.tasks.length})</h3>
            <button type="button" onClick={() => setCustomModalOpen(true)} className={buttonClasses('secondary')}>
              <Plus size={14} strokeWidth={2} />
              Custom
            </button>
          </div>
          <Card padding="none" className="max-h-[28rem] overflow-y-auto">
            {draft.tasks.length === 0 ? (
              <p className="px-4 py-6 text-center text-body-sm text-ink-400">No tasks yet — select from the library or add a custom task.</p>
            ) : (
              <div className="flex flex-col divide-y divide-surface-100">
                {draft.tasks.map((task) => (
                  <div key={task.key} className="flex items-start justify-between gap-2 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-body-sm font-medium text-ink-700">{task.title}</p>
                      <p className="text-caption text-ink-400">{PHASE_LABEL[task.phase]}</p>
                    </div>
                    <button type="button" onClick={() => removeTask(task.key)} aria-label={`Remove ${task.title}`} className="text-ink-300 hover:text-danger-600">
                      <X size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={customModalOpen} onClose={() => setCustomModalOpen(false)} title="Add a custom task" size="md"
        footer={
          <>
            <button type="button" onClick={() => setCustomModalOpen(false)} className={buttonClasses('secondary')}>Cancel</button>
            <button type="button" onClick={addCustomTask} className={buttonClasses('primary')}>Add task</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Title</span>
            <input className={INPUT_CLASSES} value={customTask.title} onChange={(e) => setCustomTask((c) => ({ ...c, title: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-label text-ink-600">Description</span>
            <textarea className={INPUT_CLASSES} rows={2} value={customTask.description} onChange={(e) => setCustomTask((c) => ({ ...c, description: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Category</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={customTask.category} onChange={(e) => setCustomTask((c) => ({ ...c, category: e.target.value as TaskCategory }))}>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{formatEnumLabel(cat)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Type</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={customTask.type} onChange={(e) => setCustomTask((c) => ({ ...c, type: e.target.value as TaskType }))}>
                {TYPES.map((t) => <option key={t} value={t}>{formatEnumLabel(t)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Phase</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={customTask.phase} onChange={(e) => setCustomTask((c) => ({ ...c, phase: e.target.value as Phase }))}>
                {PHASE_ORDER.map((p) => <option key={p} value={p}>{PHASE_LABEL[p]}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-label text-ink-600">Priority</span>
              <select className={cx(SELECT_CLASSES, 'w-full')} value={customTask.priority} onChange={(e) => setCustomTask((c) => ({ ...c, priority: e.target.value as Priority }))}>
                {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => <option key={p} value={p}>{formatEnumLabel(p)}</option>)}
              </select>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
