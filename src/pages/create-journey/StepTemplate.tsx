import type { TaskCategory } from '../../types';
import { useTaskLibrary, useTemplates } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { cx, formatEnumLabel } from '../../lib/utils';
import { draftTaskFromTemplate } from './draftHelpers';
import type { WizardDraft } from './wizardTypes';

export interface StepTemplateProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

export function StepTemplate({ draft, onChange }: StepTemplateProps) {
  const templates = useTemplates();
  const taskLibrary = useTaskLibrary();

  function selectTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const tasks = template.taskTemplateIds
      .map((id) => taskLibrary.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined && !t.archived)
      .map((t) => draftTaskFromTemplate(t, draft));
    onChange({ templateId, tasks });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h3 text-ink-800">Choose a starting template</h2>
        <p className="mt-1 text-body-sm text-ink-500">This pre-fills the task list in the next step — you can still add, remove or edit tasks afterwards.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {templates
          .filter((t) => t.status !== 'archived')
          .map((template) => {
            const domains = [
              ...new Set(
                template.taskTemplateIds.map((id) => taskLibrary.find((t) => t.id === id)?.category).filter((c): c is TaskCategory => c !== undefined),
              ),
            ];
            const selected = draft.templateId === template.id;
            return (
              <Card
                key={template.id}
                className={cx('cursor-pointer transition-colors', selected ? 'border-primary-500 ring-2 ring-primary-100' : 'hover:border-primary-200')}
              >
                <div onClick={() => selectTemplate(template.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-h3 text-ink-800">{template.name}</h3>
                    {selected && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-caption font-medium text-white">Selected</span>}
                  </div>
                  <p className="mt-1 text-body-sm text-ink-500">{template.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-body-sm text-ink-500">
                    <span>{template.taskTemplateIds.length} tasks</span>
                    <span>{template.durationDays} days</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {domains.slice(0, 6).map((d) => (
                      <span key={d} className="rounded-full bg-surface-100 px-2 py-0.5 text-caption text-ink-500">{formatEnumLabel(d)}</span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
