// SI Onboarding Hub — domain types
// This file is the single source of truth for all domain shapes and status unions.
// Nothing outside this file should redefine a status/priority/phase union.

export type Id = string;

// ---------------------------------------------------------------------------
// Status / classification unions
// ---------------------------------------------------------------------------

export type TaskStatus =
  | 'not_started'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'blocked'
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type Phase =
  | 'before_day_1'
  | 'day_1'
  | 'first_week'
  | 'first_30'
  | 'first_60'
  | 'first_90';

export type TaskType =
  | 'task'
  | 'meeting'
  | 'training'
  | 'reading'
  | 'video'
  | 'procedure'
  | 'system_access'
  | 'approval'
  | 'milestone';

export type TaskCategory =
  | 'welcome_admin'
  | 'team_org'
  | 'it_tools'
  | 'compliance'
  | 'finance_processes'
  | 'smart_infrastructure'
  | 'product_portfolio'
  | 'systems_reporting'
  | 'meetings_networking'
  | 'training'
  | 'documents_procedures'
  | 'first_30'
  | 'first_60'
  | 'first_90';

/** Overall health/progress of a journey. Not stored directly for tasks — see TaskStatus. */
export type JourneyStatus =
  | 'not_started'
  | 'on_track'
  | 'at_risk'
  | 'completed'
  | 'on_hold';

export type TemplateStatus = 'draft' | 'active' | 'archived';

export type ContractType =
  | 'permanent'
  | 'fixed_term'
  | 'internship'
  | 'working_student';

/** The 10 departments explicitly listed in the seed-data brief. */
export type Department =
  | 'Finance'
  | 'Controlling'
  | 'Digitalization'
  | 'Performance Management'
  | 'Project Management'
  | 'Business Administration'
  | 'Smart Infrastructure'
  | 'Electrification'
  | 'Buildings'
  | 'Operations';

/**
 * A team is a manager-led sub-group within a Department — free text because
 * each team is effectively defined by the manager who runs it (e.g. "Group
 * Reporting", "Regional Controlling DACH"), not by a fixed company-wide list.
 */
export type Team = string;

/**
 * Relationship-based default assignee for a TaskTemplate (as opposed to
 * Person.role, which is a free-text job title). Resolved to a real Person.id
 * when a template is instantiated into a Journey.
 */
export type DefaultOwnerRole =
  | 'manager'
  | 'buddy'
  | 'hr'
  | 'it'
  | 'team_lead'
  | 'trainer'
  | 'process_owner'
  | 'finance'
  | 'new_joiner';

/** Drives which point of view the whole app renders from (topbar switcher). */
export type ViewerRole = 'manager' | 'new_joiner' | 'task_owner';

export type ActivityType =
  | 'journey_created'
  | 'journey_updated'
  | 'task_completed'
  | 'task_status_changed'
  | 'task_added'
  | 'task_removed'
  | 'task_rescheduled'
  | 'task_reassigned'
  | 'comment_added'
  | 'reminder_sent';

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

export interface Person {
  id: Id;
  firstName: string;
  lastName: string;
  initials: string;
  /** Free-text job title, e.g. "Financial Controller". */
  role: string;
  department: Department;
  team: Team;
  email: string;
  /** Tailwind-safe color token used to render the avatar background. */
  avatarColor: string;
}

export interface Comment {
  id: Id;
  authorId: Id;
  text: string;
  timestamp: string;
}

export interface TaskTemplate {
  id: Id;
  title: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  /** Human-readable estimate, e.g. "30 min", "1–2 hours". */
  estimatedDuration: string;
  defaultOwnerRole: DefaultOwnerRole;
  recommendedPhase: Phase;
  priority: Priority;
  tags: string[];
  resourceUrl?: string;
  resourceLabel?: string;
  archived: boolean;
}

export interface JourneyTask {
  id: Id;
  /** Set when the task was instantiated from the library; absent for ad-hoc tasks. */
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
  status: TaskStatus;
  mandatory: boolean;
  /** Ids of other JourneyTasks within the same journey that must complete first. */
  dependsOn: Id[];
  completedAt?: string;
  comments: Comment[];
}

export interface ActivityEntry {
  id: Id;
  journeyId: Id;
  type: ActivityType;
  actorId: Id;
  message: string;
  timestamp: string;
}

export interface Journey {
  id: Id;
  employee: Person;
  position: string;
  department: Department;
  team: Team;
  managerId: Id;
  buddyId: Id;
  startDate: string;
  location: string;
  contractType: ContractType;
  templateId: Id;
  status: JourneyStatus;
  tasks: JourneyTask[];
  activity: ActivityEntry[];
}

export interface OnboardingTemplate {
  id: Id;
  name: string;
  description: string;
  /** Which department this template targets — categorization, not a specific manager's team. */
  team: Department;
  durationDays: number;
  taskTemplateIds: Id[];
  updatedAt: string;
  ownerId: Id;
  status: TemplateStatus;
}

// ---------------------------------------------------------------------------
// Derived / selector shapes (never persisted — always computed)
// ---------------------------------------------------------------------------

export interface JourneyProgress {
  journeyId: Id;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  percentComplete: number;
}

export interface TaskStatusCounts {
  not_started: number;
  planned: number;
  in_progress: number;
  completed: number;
  overdue: number;
  blocked: number;
  cancelled: number;
}
