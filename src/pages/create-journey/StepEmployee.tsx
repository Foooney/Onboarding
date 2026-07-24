import type { ReactNode } from 'react';
import type { ContractType, Department } from '../../types';
import { usePeople } from '../../lib/store';
import { DatePicker } from '../../components/ui/DatePicker';
import { INPUT_CLASSES, SELECT_CLASSES, cx, formatEnumLabel } from '../../lib/utils';
import { suggestedEmail } from './draftHelpers';
import type { WizardDraft } from './wizardTypes';

export interface StepEmployeeProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

const DEPARTMENTS: Department[] = [
  'Finance', 'Controlling', 'Digitalization', 'Performance Management', 'Project Management',
  'Business Administration', 'Smart Infrastructure', 'Electrification', 'Buildings', 'Operations',
];

const CONTRACT_TYPES: ContractType[] = ['permanent', 'fixed_term', 'internship', 'working_student'];

export function StepEmployee({ draft, onChange }: StepEmployeeProps) {
  const people = usePeople();
  const sortedPeople = [...people].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

  function selectExisting(id: string) {
    const person = people.find((p) => p.id === id);
    onChange({
      employeeMode: 'existing',
      existingEmployeeId: id,
      position: person?.role ?? draft.position,
      department: person?.department ?? draft.department,
      team: person?.team ?? draft.team,
    });
  }

  function updateName(first: string, last: string) {
    const patch: Partial<WizardDraft> = { newFirstName: first, newLastName: last };
    if (!draft.newEmail) patch.newEmail = suggestedEmail(first, last);
    onChange(patch);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h3 text-ink-800">Who is this journey for?</h2>
        <div className="mt-3 inline-flex rounded-lg border border-surface-200 p-1">
          <button
            type="button"
            onClick={() => onChange({ employeeMode: 'new' })}
            className={cx('rounded-md px-3 py-1.5 text-body-sm font-medium', draft.employeeMode === 'new' ? 'bg-primary-50 text-primary-700' : 'text-ink-500')}
          >
            New profile
          </button>
          <button
            type="button"
            onClick={() => onChange({ employeeMode: 'existing' })}
            className={cx('rounded-md px-3 py-1.5 text-body-sm font-medium', draft.employeeMode === 'existing' ? 'bg-primary-50 text-primary-700' : 'text-ink-500')}
          >
            Existing profile
          </button>
        </div>
      </div>

      {draft.employeeMode === 'existing' ? (
        <Field label="Select a person">
          <select className={cx(SELECT_CLASSES, 'w-full')} value={draft.existingEmployeeId ?? ''} onChange={(e) => selectExisting(e.target.value)}>
            <option value="" disabled>Choose someone…</option>
            {sortedPeople.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.role}</option>
            ))}
          </select>
        </Field>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name">
            <input className={INPUT_CLASSES} value={draft.newFirstName} onChange={(e) => updateName(e.target.value, draft.newLastName)} />
          </Field>
          <Field label="Last name">
            <input className={INPUT_CLASSES} value={draft.newLastName} onChange={(e) => updateName(draft.newFirstName, e.target.value)} />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <input className={INPUT_CLASSES} value={draft.newEmail} onChange={(e) => onChange({ newEmail: e.target.value })} placeholder="firstname.lastname@siemens.com" />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Position / job title">
          <input className={INPUT_CLASSES} value={draft.position} onChange={(e) => onChange({ position: e.target.value })} placeholder="e.g. Financial Controller" />
        </Field>
        <Field label="Department">
          <select className={cx(SELECT_CLASSES, 'w-full')} value={draft.department} onChange={(e) => onChange({ department: e.target.value as Department })}>
            <option value="" disabled>Select a department…</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Team">
          <input className={INPUT_CLASSES} value={draft.team} onChange={(e) => onChange({ team: e.target.value })} placeholder="e.g. Group Controlling" />
        </Field>
        <Field label="Contract type">
          <select className={cx(SELECT_CLASSES, 'w-full')} value={draft.contractType} onChange={(e) => onChange({ contractType: e.target.value as ContractType })}>
            <option value="" disabled>Select a contract type…</option>
            {CONTRACT_TYPES.map((c) => <option key={c} value={c}>{formatEnumLabel(c)}</option>)}
          </select>
        </Field>
        <Field label="Manager">
          <select className={cx(SELECT_CLASSES, 'w-full')} value={draft.managerId} onChange={(e) => onChange({ managerId: e.target.value })}>
            <option value="" disabled>Select a manager…</option>
            {sortedPeople.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </select>
        </Field>
        <Field label="Buddy">
          <select className={cx(SELECT_CLASSES, 'w-full')} value={draft.buddyId} onChange={(e) => onChange({ buddyId: e.target.value })}>
            <option value="" disabled>Select a buddy…</option>
            {sortedPeople.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </select>
        </Field>
        <DatePicker label="Start date" value={draft.startDate} onChange={(v) => onChange({ startDate: v })} />
        <Field label="Location">
          <input className={INPUT_CLASSES} value={draft.location} onChange={(e) => onChange({ location: e.target.value })} placeholder="e.g. Erlangen, Germany" />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx('flex flex-col gap-1.5', className)}>
      <span className="text-label text-ink-600">{label}</span>
      {children}
    </label>
  );
}
