import type { ContractType, Department, Id, Phase, Priority, TaskCategory, TaskType, Team } from '../../types';

export interface DraftTask {
  key: string;
  templateId?: Id;
  title: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  phase: Phase;
  ownerId: Id;
  buddyId?: Id;
  dueDate: string;
  priority: Priority;
  mandatory: boolean;
  /** References other DraftTask.key values — resolved to real ids at launch. */
  dependsOn: string[];
}

export interface WizardDraft {
  employeeMode: 'existing' | 'new';
  existingEmployeeId?: Id;
  newFirstName: string;
  newLastName: string;
  newEmail: string;
  newAvatarColor: string;
  position: string;
  department: Department | '';
  team: Team;
  managerId: Id | '';
  buddyId: Id | '';
  startDate: string;
  location: string;
  contractType: ContractType | '';
  templateId: Id | '';
  tasks: DraftTask[];
}
