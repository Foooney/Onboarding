import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ContractType, Department } from '../../types';
import { useApp, usePeople, useTaskLibrary, useTemplates } from '../../lib/store';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Stepper } from '../../components/ui/Stepper';
import { formatDisplayDate } from '../../lib/status';
import { buttonClasses, getInitials } from '../../lib/utils';
import { createInitialDraft, draftTaskFromTemplate } from './draftHelpers';
import { StepEmployee } from './StepEmployee';
import { StepTemplate } from './StepTemplate';
import { StepTasks } from './StepTasks';
import { StepAssignment } from './StepAssignment';
import { StepReview } from './StepReview';
import type { WizardDraft } from './wizardTypes';

const STEP_LABELS = ['Employee', 'Template', 'Tasks', 'Assignment', 'Review'];

function isStepValid(step: number, draft: WizardDraft): boolean {
  switch (step) {
    case 0: {
      const employeeOk =
        draft.employeeMode === 'existing' ? Boolean(draft.existingEmployeeId) : Boolean(draft.newFirstName.trim() && draft.newLastName.trim() && draft.newEmail.trim());
      return (
        employeeOk &&
        Boolean(draft.position.trim() && draft.department && draft.team.trim() && draft.managerId && draft.buddyId && draft.startDate && draft.location.trim() && draft.contractType)
      );
    }
    case 1:
      return Boolean(draft.templateId);
    case 2:
      return draft.tasks.length > 0;
    case 3:
      return draft.tasks.every((t) => t.ownerId && t.dueDate);
    case 4:
      return true;
    default:
      return false;
  }
}

export function CreateJourneyWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createJourney } = useApp();
  const templates = useTemplates();
  const taskLibrary = useTaskLibrary();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(createInitialDraft);

  function updateDraft(patch: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  // Arriving from Templates → "Use template": pre-select it and pre-fill the
  // task list, so the manager only has to fill in the employee's details.
  useEffect(() => {
    const initialTemplateId = (location.state as { initialTemplateId?: string } | null)?.initialTemplateId;
    if (!initialTemplateId) return;
    const template = templates.find((t) => t.id === initialTemplateId);
    if (!template) return;
    setDraft((prev) => {
      if (prev.templateId) return prev; // already initialized (e.g. after a hot reload)
      const tasks = template.taskTemplateIds
        .map((id) => taskLibrary.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined && !t.archived)
        .map((t) => draftTaskFromTemplate(t, prev));
      return { ...prev, templateId: template.id, tasks };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid = isStepValid(step, draft);

  function launch() {
    const keyToIndex = new Map(draft.tasks.map((t, index) => [t.key, index]));
    const employeeName =
      draft.employeeMode === 'existing'
        ? undefined // resolved by the store from the existing person record
        : `${draft.newFirstName} ${draft.newLastName}`;

    const journeyId = createJourney({
      employeeId: draft.employeeMode === 'existing' ? draft.existingEmployeeId : undefined,
      newEmployee:
        draft.employeeMode === 'new'
          ? {
              firstName: draft.newFirstName.trim(),
              lastName: draft.newLastName.trim(),
              initials: getInitials(draft.newFirstName, draft.newLastName),
              role: draft.position,
              department: draft.department as Department,
              team: draft.team,
              email: draft.newEmail.trim(),
              avatarColor: draft.newAvatarColor,
            }
          : undefined,
      position: draft.position,
      department: draft.department as Department,
      team: draft.team,
      managerId: draft.managerId,
      buddyId: draft.buddyId,
      startDate: draft.startDate,
      location: draft.location,
      contractType: draft.contractType as ContractType,
      templateId: draft.templateId,
      tasks: draft.tasks.map((t) => ({
        templateId: t.templateId,
        title: t.title,
        description: t.description,
        category: t.category,
        type: t.type,
        phase: t.phase,
        ownerId: t.ownerId,
        buddyId: t.buddyId,
        dueDate: t.dueDate,
        priority: t.priority,
        mandatory: t.mandatory,
        dependsOn: t.dependsOn.map((key) => keyToIndex.get(key)).filter((i): i is number => i !== undefined),
      })),
    });

    showToast(`Onboarding launched${employeeName ? ` for ${employeeName}` : ''}.`, 'success');
    navigate(`/journeys/${journeyId}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-display text-ink-800">Create Onboarding</h1>
        <p className="mt-1 text-body text-ink-500">Set up a new onboarding journey in five steps.</p>
      </div>

      <Stepper steps={STEP_LABELS} currentStep={step} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          {step === 0 && <StepEmployee draft={draft} onChange={updateDraft} />}
          {step === 1 && <StepTemplate draft={draft} onChange={updateDraft} />}
          {step === 2 && <StepTasks draft={draft} onChange={updateDraft} />}
          {step === 3 && <StepAssignment draft={draft} onChange={updateDraft} />}
          {step === 4 && <StepReview draft={draft} />}
        </Card>

        <SummaryPanel draft={draft} />
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className={buttonClasses('secondary')}>
          Back
        </button>
        <div className="flex items-center gap-3">
          {!valid && <span className="text-body-sm text-ink-400">{stepHint(step)}</span>}
          {step < 4 ? (
            <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!valid} className={buttonClasses('primary')}>
              Next
            </button>
          ) : (
            <button type="button" onClick={launch} className={buttonClasses('primary')}>
              Launch onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function stepHint(step: number): string {
  switch (step) {
    case 0:
      return 'Fill in every field to continue.';
    case 1:
      return 'Select a template to continue.';
    case 2:
      return 'Add at least one task to continue.';
    case 3:
      return 'Every task needs an owner and a due date.';
    default:
      return '';
  }
}

function SummaryPanel({ draft }: { draft: WizardDraft }) {
  const people = usePeople();
  const templates = useTemplates();

  const existingEmployee = draft.employeeMode === 'existing' ? people.find((p) => p.id === draft.existingEmployeeId) : undefined;
  const firstName = existingEmployee?.firstName ?? draft.newFirstName;
  const lastName = existingEmployee?.lastName ?? draft.newLastName;
  const manager = people.find((p) => p.id === draft.managerId);
  const buddy = people.find((p) => p.id === draft.buddyId);
  const template = templates.find((t) => t.id === draft.templateId);

  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <h2 className="text-label uppercase tracking-wide text-ink-400">In progress</h2>
      <p className="mt-2 text-body-lg font-semibold text-ink-800">
        {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'New onboarding'}
      </p>
      {draft.position && <p className="text-body-sm text-ink-500">{draft.position}</p>}

      <dl className="mt-4 flex flex-col gap-2.5 text-body-sm">
        <SummaryRow label="Team" value={draft.team || '—'} />
        <SummaryRow label="Manager" value={manager ? `${manager.firstName} ${manager.lastName}` : '—'} />
        <SummaryRow label="Buddy" value={buddy ? `${buddy.firstName} ${buddy.lastName}` : '—'} />
        <SummaryRow label="Start date" value={draft.startDate ? formatDisplayDate(draft.startDate) : '—'} />
        <SummaryRow label="Template" value={template?.name ?? '—'} />
        <SummaryRow label="Tasks" value={String(draft.tasks.length)} />
      </dl>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-surface-100 pt-2.5 first:border-0 first:pt-0">
      <dt className="text-ink-400">{label}</dt>
      <dd className="max-w-[60%] truncate text-right font-medium text-ink-700">{value}</dd>
    </div>
  );
}
