import { FileText, GraduationCap, Link2, ShieldCheck, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Journey, JourneyTask, TaskTemplate, TaskType } from '../../types';
import { useTaskLibrary } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatEnumLabel } from '../../lib/utils';

export interface DocumentsTabProps {
  journey: Journey;
}

interface DocumentEntry {
  task: JourneyTask;
  template: TaskTemplate;
}

const TYPE_ICON: Partial<Record<TaskType, LucideIcon>> = {
  reading: FileText,
  training: GraduationCap,
  video: Video,
  procedure: ShieldCheck,
};

export function DocumentsTab({ journey }: DocumentsTabProps) {
  const taskLibrary = useTaskLibrary();

  const documents: DocumentEntry[] = [];
  const seenTemplateIds = new Set<string>();
  for (const task of journey.tasks) {
    if (!task.templateId || seenTemplateIds.has(task.templateId)) continue;
    const template = taskLibrary.find((t) => t.id === task.templateId);
    if (!template?.resourceUrl) continue;
    seenTemplateIds.add(template.id);
    documents.push({ task, template });
  }

  if (documents.length === 0) {
    return <EmptyState icon={FileText} title="No documents yet" description="Resources linked from this journey's tasks will show up here." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map(({ task, template }) => {
        const Icon = TYPE_ICON[template.type] ?? Link2;
        return (
          <Card key={template.id}>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <a
                  href={template.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body font-medium text-ink-800 hover:text-primary-700 hover:underline"
                >
                  {template.resourceLabel ?? template.title}
                </a>
                <p className="mt-1 text-body-sm text-ink-400">{formatEnumLabel(template.type)} · linked from "{task.title}"</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
