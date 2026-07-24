import type { DefaultOwnerRole, Id, Phase, TaskTemplate } from '../../types';
import { addDays } from '../../lib/status';
import { PHASE_DEFAULT_OFFSET } from '../../lib/phases';
import { AVATAR_COLOR_CLASSES, uniqueId } from '../../lib/utils';
import type { DraftTask, WizardDraft } from './wizardTypes';

// Roles that don't map to the employee's own manager/buddy resolve to the
// same fixed HR/IT/training contacts the seed data uses — they're real
// people already in the system, not placeholders.
const FIXED_ROLE_CONTACTS: Partial<Record<DefaultOwnerRole, Id>> = {
  hr: 'vanessa-koch',
  it: 'robert-schmitt',
  trainer: 'andrea-lang',
  process_owner: 'vanessa-koch',
};

export function resolveDefaultOwner(role: DefaultOwnerRole, draft: Pick<WizardDraft, 'managerId' | 'buddyId'>): Id {
  if (role === 'buddy') return draft.buddyId || draft.managerId || '';
  if (role === 'manager' || role === 'team_lead' || role === 'finance' || role === 'new_joiner') {
    return draft.managerId || '';
  }
  return FIXED_ROLE_CONTACTS[role] ?? draft.managerId ?? '';
}

export function defaultDueDate(startDate: string, phase: Phase): string {
  if (!startDate) return '';
  return addDays(startDate, PHASE_DEFAULT_OFFSET[phase]);
}

export function draftTaskFromTemplate(template: TaskTemplate, draft: Pick<WizardDraft, 'managerId' | 'buddyId' | 'startDate'>): DraftTask {
  return {
    key: uniqueId('draft'),
    templateId: template.id,
    title: template.title,
    description: template.description,
    category: template.category,
    type: template.type,
    phase: template.recommendedPhase,
    ownerId: resolveDefaultOwner(template.defaultOwnerRole, draft),
    dueDate: defaultDueDate(draft.startDate, template.recommendedPhase),
    priority: template.priority,
    mandatory: template.priority !== 'low',
    dependsOn: [],
  };
}

const AVATAR_COLOR_KEYS = Object.keys(AVATAR_COLOR_CLASSES);

export function pickRandomAvatarColor(): string {
  return AVATAR_COLOR_KEYS[Math.floor(Math.random() * AVATAR_COLOR_KEYS.length)];
}

export function suggestedEmail(firstName: string, lastName: string): string {
  const clean = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-z]/g, '');
  if (!firstName.trim() || !lastName.trim()) return '';
  return `${clean(firstName)}.${clean(lastName)}@siemens.com`;
}

export function createInitialDraft(): WizardDraft {
  return {
    employeeMode: 'new',
    existingEmployeeId: undefined,
    newFirstName: '',
    newLastName: '',
    newEmail: '',
    newAvatarColor: pickRandomAvatarColor(),
    position: '',
    department: '',
    team: '',
    managerId: '',
    buddyId: '',
    startDate: '',
    location: '',
    contractType: '',
    templateId: '',
    tasks: [],
  };
}
