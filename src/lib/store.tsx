import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActivityEntry,
  ActivityType,
  ContractType,
  Department,
  Id,
  Journey,
  JourneyStatus,
  JourneyTask,
  OnboardingTemplate,
  Person,
  Phase,
  Priority,
  TaskCategory,
  TaskStatus,
  TaskTemplate,
  TaskType,
  Team,
  TemplateStatus,
  ViewerRole,
} from '../types';
import { seed } from '../data';
import { formatDate, today } from './status';
import { slugify, uniqueId } from './utils';

const STORAGE_KEY = 'si_onboarding_hub_v1';

const VIEWER_PERSONA: Record<ViewerRole, Id> = {
  manager: 'markus-klein',
  new_joiner: 'anna-mueller',
  task_owner: 'julia-schneider',
};

interface PersistedState {
  people: Person[];
  taskLibrary: TaskTemplate[];
  templates: OnboardingTemplate[];
  journeys: Journey[];
  viewerRole: ViewerRole;
}

function defaultState(): PersistedState {
  return {
    people: seed.people,
    taskLibrary: seed.taskLibrary,
    templates: seed.templates,
    journeys: seed.journeys,
    viewerRole: 'manager',
  };
}

function isPersistedState(value: unknown): value is PersistedState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.people) &&
    Array.isArray(v.taskLibrary) &&
    Array.isArray(v.templates) &&
    Array.isArray(v.journeys) &&
    typeof v.viewerRole === 'string'
  );
}

function loadState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed: unknown = JSON.parse(raw);
    return isPersistedState(parsed) ? parsed : defaultState();
  } catch {
    return defaultState();
  }
}

function makeActivity(journeyId: Id, type: ActivityType, actorId: Id, message: string): ActivityEntry {
  return {
    id: uniqueId(`act-${journeyId}`),
    journeyId,
    type,
    actorId,
    message,
    timestamp: new Date().toISOString(),
  };
}

function uniqueSlugId(base: string, existingIds: Id[]): Id {
  const slug = slugify(base) || uniqueId('item');
  if (!existingIds.includes(slug)) return slug;
  let suffix = 2;
  while (existingIds.includes(`${slug}-${suffix}`)) suffix += 1;
  return `${slug}-${suffix}`;
}

// ---------------------------------------------------------------------------
// Action input DTOs
// ---------------------------------------------------------------------------

export interface NewTaskInput {
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
  dependsOn?: Id[];
  status?: TaskStatus;
}

// Same shape as a task to add, except dependsOn points at sibling tasks by
// their index within this same batch — the real ids don't exist yet at the
// point the wizard builds this payload, so index is the only stable handle.
export interface NewJourneyTaskInput extends Omit<NewTaskInput, 'dependsOn'> {
  dependsOn?: number[];
}

export interface NewJourneyInput {
  employeeId?: Id;
  newEmployee?: Omit<Person, 'id'>;
  position: string;
  department: Department;
  team: Team;
  managerId: Id;
  buddyId: Id;
  startDate: string;
  location: string;
  contractType: ContractType;
  templateId: Id;
  status?: JourneyStatus;
  tasks: NewJourneyTaskInput[];
}

export type JourneyDetailsPatch = Partial<
  Pick<Journey, 'status' | 'startDate' | 'location' | 'contractType' | 'managerId' | 'buddyId' | 'position' | 'department' | 'team'>
>;

export interface NewTaskTemplateInput {
  title: string;
  description: string;
  category: TaskCategory;
  type: TaskType;
  estimatedDuration: string;
  defaultOwnerRole: TaskTemplate['defaultOwnerRole'];
  recommendedPhase: Phase;
  priority: Priority;
  tags: string[];
  resourceUrl?: string;
  resourceLabel?: string;
}

export interface NewOnboardingTemplateInput {
  name: string;
  description: string;
  team: Department;
  durationDays: number;
  taskTemplateIds: Id[];
  ownerId: Id;
  status?: TemplateStatus;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
  people: Person[];
  taskLibrary: TaskTemplate[];
  templates: OnboardingTemplate[];
  journeys: Journey[];
  viewerRole: ViewerRole;
  currentUser: Person;
  setViewerRole: (role: ViewerRole) => void;
  createJourney: (input: NewJourneyInput) => Id;
  updateJourney: (journeyId: Id, patch: JourneyDetailsPatch) => void;
  deleteJourney: (journeyId: Id) => void;
  addTask: (journeyId: Id, task: NewTaskInput) => Id;
  updateTask: (journeyId: Id, taskId: Id, patch: Partial<JourneyTask>) => void;
  removeTask: (journeyId: Id, taskId: Id) => void;
  setTaskStatus: (journeyId: Id, taskId: Id, status: TaskStatus) => void;
  rescheduleTask: (journeyId: Id, taskId: Id, newDueDate: string) => void;
  addComment: (journeyId: Id, taskId: Id, text: string) => void;
  createTaskTemplate: (input: NewTaskTemplateInput) => Id;
  updateTaskTemplate: (templateId: Id, patch: Partial<TaskTemplate>) => void;
  duplicateTaskTemplate: (templateId: Id) => Id;
  archiveTaskTemplate: (templateId: Id, archived?: boolean) => void;
  createOnboardingTemplate: (input: NewOnboardingTemplateInput) => Id;
  updateOnboardingTemplate: (templateId: Id, patch: Partial<OnboardingTemplate>) => void;
  duplicateOnboardingTemplate: (templateId: Id) => Id;
  sendReminder: (journeyId: Id, taskId: Id) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — the demo keeps running in memory only.
    }
  }, [state]);

  const currentUser = useMemo(() => {
    const id = VIEWER_PERSONA[state.viewerRole];
    return state.people.find((p) => p.id === id) ?? state.people[0];
  }, [state.viewerRole, state.people]);

  function withJourney(journeyId: Id, updater: (journey: Journey) => Journey) {
    setState((prev) => ({
      ...prev,
      journeys: prev.journeys.map((j) => (j.id === journeyId ? updater(j) : j)),
    }));
  }

  function setViewerRole(role: ViewerRole) {
    setState((prev) => ({ ...prev, viewerRole: role }));
  }

  function createJourney(input: NewJourneyInput): Id {
    const journeyId = uniqueId('journey');
    const resolvedEmployee: Person = input.employeeId
      ? state.people.find((p) => p.id === input.employeeId)!
      : { ...input.newEmployee!, id: uniqueId('person') };

    const taskIds = input.tasks.map((_, index) => `${journeyId}-task-${index}-${uniqueId('t')}`);
    const tasks: JourneyTask[] = input.tasks.map((t, index) => ({
      id: taskIds[index],
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
      status: t.status ?? 'not_started',
      mandatory: t.mandatory,
      dependsOn: (t.dependsOn ?? []).map((depIndex) => taskIds[depIndex]).filter((depId): depId is Id => Boolean(depId)),
      comments: [],
    }));

    const journey: Journey = {
      id: journeyId,
      employee: resolvedEmployee,
      position: input.position,
      department: input.department,
      team: input.team,
      managerId: input.managerId,
      buddyId: input.buddyId,
      startDate: input.startDate,
      location: input.location,
      contractType: input.contractType,
      templateId: input.templateId,
      status: input.status ?? 'not_started',
      tasks,
      activity: [
        makeActivity(
          journeyId,
          'journey_created',
          currentUser.id,
          `Onboarding journey created for ${resolvedEmployee.firstName} ${resolvedEmployee.lastName}.`,
        ),
      ],
    };

    setState((prev) => ({
      ...prev,
      people: input.employeeId ? prev.people : [...prev.people, resolvedEmployee],
      journeys: [...prev.journeys, journey],
    }));

    return journeyId;
  }

  function updateJourney(journeyId: Id, patch: JourneyDetailsPatch) {
    withJourney(journeyId, (journey) => ({
      ...journey,
      ...patch,
      activity: [...journey.activity, makeActivity(journeyId, 'journey_updated', currentUser.id, 'Journey details updated.')],
    }));
  }

  function deleteJourney(journeyId: Id) {
    setState((prev) => ({ ...prev, journeys: prev.journeys.filter((j) => j.id !== journeyId) }));
  }

  function addTask(journeyId: Id, task: NewTaskInput): Id {
    const taskId = `${journeyId}-task-${uniqueId('t')}`;
    withJourney(journeyId, (journey) => ({
      ...journey,
      tasks: [
        ...journey.tasks,
        {
          id: taskId,
          templateId: task.templateId,
          title: task.title,
          description: task.description,
          category: task.category,
          type: task.type,
          phase: task.phase,
          ownerId: task.ownerId,
          buddyId: task.buddyId,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status ?? 'not_started',
          mandatory: task.mandatory,
          dependsOn: task.dependsOn ?? [],
          comments: [],
        },
      ],
      activity: [...journey.activity, makeActivity(journeyId, 'task_added', currentUser.id, `Added task "${task.title}".`)],
    }));
    return taskId;
  }

  function updateTask(journeyId: Id, taskId: Id, patch: Partial<JourneyTask>) {
    withJourney(journeyId, (journey) => {
      const target = journey.tasks.find((t) => t.id === taskId);
      if (!target) return journey;
      return {
        ...journey,
        tasks: journey.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        activity: [...journey.activity, makeActivity(journeyId, 'task_status_changed', currentUser.id, `Updated "${target.title}".`)],
      };
    });
  }

  function removeTask(journeyId: Id, taskId: Id) {
    withJourney(journeyId, (journey) => {
      const target = journey.tasks.find((t) => t.id === taskId);
      if (!target) return journey;
      return {
        ...journey,
        tasks: journey.tasks.filter((t) => t.id !== taskId),
        activity: [...journey.activity, makeActivity(journeyId, 'task_removed', currentUser.id, `Removed task "${target.title}".`)],
      };
    });
  }

  function setTaskStatus(journeyId: Id, taskId: Id, status: TaskStatus) {
    withJourney(journeyId, (journey) => {
      const target = journey.tasks.find((t) => t.id === taskId);
      if (!target) return journey;
      const completedAt = status === 'completed' ? formatDate(today()) : undefined;
      const activityType: ActivityType = status === 'completed' ? 'task_completed' : 'task_status_changed';
      const message =
        status === 'completed'
          ? `Completed "${target.title}".`
          : `Marked "${target.title}" as ${status.replace('_', ' ')}.`;
      return {
        ...journey,
        tasks: journey.tasks.map((t) => (t.id === taskId ? { ...t, status, completedAt } : t)),
        activity: [...journey.activity, makeActivity(journeyId, activityType, currentUser.id, message)],
      };
    });
  }

  function rescheduleTask(journeyId: Id, taskId: Id, newDueDate: string) {
    withJourney(journeyId, (journey) => {
      const target = journey.tasks.find((t) => t.id === taskId);
      if (!target) return journey;
      return {
        ...journey,
        tasks: journey.tasks.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate } : t)),
        activity: [
          ...journey.activity,
          makeActivity(journeyId, 'task_rescheduled', currentUser.id, `Rescheduled "${target.title}" to ${newDueDate}.`),
        ],
      };
    });
  }

  function addComment(journeyId: Id, taskId: Id, text: string) {
    withJourney(journeyId, (journey) => {
      const target = journey.tasks.find((t) => t.id === taskId);
      if (!target) return journey;
      return {
        ...journey,
        tasks: journey.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                comments: [
                  ...t.comments,
                  { id: uniqueId('comment'), authorId: currentUser.id, text, timestamp: new Date().toISOString() },
                ],
              }
            : t,
        ),
        activity: [
          ...journey.activity,
          makeActivity(journeyId, 'comment_added', currentUser.id, `Commented on "${target.title}".`),
        ],
      };
    });
  }

  function createTaskTemplate(input: NewTaskTemplateInput): Id {
    const id = uniqueSlugId(input.title, state.taskLibrary.map((t) => t.id));
    const template: TaskTemplate = { ...input, id, archived: false };
    setState((prev) => ({ ...prev, taskLibrary: [...prev.taskLibrary, template] }));
    return id;
  }

  function updateTaskTemplate(templateId: Id, patch: Partial<TaskTemplate>) {
    setState((prev) => ({
      ...prev,
      taskLibrary: prev.taskLibrary.map((t) => (t.id === templateId ? { ...t, ...patch } : t)),
    }));
  }

  function duplicateTaskTemplate(templateId: Id): Id {
    const source = state.taskLibrary.find((t) => t.id === templateId);
    if (!source) return templateId;
    const id = uniqueSlugId(`${source.id}-copy`, state.taskLibrary.map((t) => t.id));
    const copy: TaskTemplate = { ...source, id, title: `${source.title} (Copy)`, archived: false };
    setState((prev) => ({ ...prev, taskLibrary: [...prev.taskLibrary, copy] }));
    return id;
  }

  function archiveTaskTemplate(templateId: Id, archived = true) {
    setState((prev) => ({
      ...prev,
      taskLibrary: prev.taskLibrary.map((t) => (t.id === templateId ? { ...t, archived } : t)),
    }));
  }

  function createOnboardingTemplate(input: NewOnboardingTemplateInput): Id {
    const id = uniqueSlugId(`tpl-${input.name}`, state.templates.map((t) => t.id));
    const template: OnboardingTemplate = { ...input, id, status: input.status ?? 'draft', updatedAt: formatDate(today()) };
    setState((prev) => ({ ...prev, templates: [...prev.templates, template] }));
    return id;
  }

  function updateOnboardingTemplate(templateId: Id, patch: Partial<OnboardingTemplate>) {
    setState((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === templateId ? { ...t, ...patch, updatedAt: formatDate(today()) } : t)),
    }));
  }

  function duplicateOnboardingTemplate(templateId: Id): Id {
    const source = state.templates.find((t) => t.id === templateId);
    if (!source) return templateId;
    const id = uniqueSlugId(`${source.id}-copy`, state.templates.map((t) => t.id));
    const copy: OnboardingTemplate = {
      ...source,
      id,
      name: `${source.name} (Copy)`,
      status: 'draft',
      updatedAt: formatDate(today()),
    };
    setState((prev) => ({ ...prev, templates: [...prev.templates, copy] }));
    return id;
  }

  function sendReminder(journeyId: Id, taskId: Id) {
    withJourney(journeyId, (journey) => {
      const target = journey.tasks.find((t) => t.id === taskId);
      if (!target) return journey;
      return {
        ...journey,
        activity: [
          ...journey.activity,
          makeActivity(journeyId, 'reminder_sent', currentUser.id, `Sent a reminder for "${target.title}".`),
        ],
      };
    });
  }

  function resetDemoData() {
    setState(defaultState());
  }

  const value: AppContextValue = {
    people: state.people,
    taskLibrary: state.taskLibrary,
    templates: state.templates,
    journeys: state.journeys,
    viewerRole: state.viewerRole,
    currentUser,
    setViewerRole,
    createJourney,
    updateJourney,
    deleteJourney,
    addTask,
    updateTask,
    removeTask,
    setTaskStatus,
    rescheduleTask,
    addComment,
    createTaskTemplate,
    updateTaskTemplate,
    duplicateTaskTemplate,
    archiveTaskTemplate,
    createOnboardingTemplate,
    updateOnboardingTemplate,
    duplicateOnboardingTemplate,
    sendReminder,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

export function usePeople(): Person[] {
  return useApp().people;
}

export function useTaskLibrary(): TaskTemplate[] {
  return useApp().taskLibrary;
}

export function useTemplates(): OnboardingTemplate[] {
  return useApp().templates;
}

export function useJourneys(): Journey[] {
  return useApp().journeys;
}

export function useViewerRole(): ViewerRole {
  return useApp().viewerRole;
}

export function useCurrentUser(): Person {
  return useApp().currentUser;
}
