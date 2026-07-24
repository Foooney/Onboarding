import type {
  ActivityEntry,
  Comment,
  DefaultOwnerRole,
  Id,
  Journey,
  JourneyTask,
  Person,
  Phase,
  TaskStatus,
} from '../types';
import { people } from './people';
import { taskLibrary } from './taskLibrary';
import { templates } from './templates';
import { addDays, daysBetween, today } from '../lib/status';

function person(id: Id): Person {
  const found = people.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown person id: ${id}`);
  return found;
}

function templateTaskIdsFor(templateId: Id): Id[] {
  const template = templates.find((t) => t.id === templateId);
  if (!template) throw new Error(`Unknown onboarding template id: ${templateId}`);
  return template.taskTemplateIds;
}

const TODAY = today();

// ===========================================================================
// Anna Müller — the flagship journey. Hand-authored task by task: this is the
// data every other screen in the app gets judged against.
// ===========================================================================

const ANNA_ID = 'journey-anna-mueller';

const annaTasks: JourneyTask[] = [
  {
    id: 'anna-sign-employment-documents',
    templateId: 'sign-employment-documents',
    title: 'Sign employment contract and onboarding documents',
    description: 'Review and countersign the employment contract, confidentiality agreement and IT usage policy.',
    category: 'welcome_admin',
    type: 'approval',
    phase: 'before_day_1',
    ownerId: 'vanessa-koch',
    dueDate: '2026-04-29',
    priority: 'critical',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-04-29',
    comments: [],
  },
  {
    id: 'anna-welcome-meeting',
    templateId: 'welcome-meeting',
    title: 'Attend welcome meeting with your manager',
    description: 'Kick off the journey with a first conversation covering role expectations, team context and the onboarding plan.',
    category: 'welcome_admin',
    type: 'meeting',
    phase: 'day_1',
    ownerId: 'markus-klein',
    dueDate: '2026-05-04',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-04',
    comments: [],
  },
  {
    id: 'anna-hr-induction-session',
    templateId: 'hr-induction-session',
    title: 'Complete HR induction session',
    description: 'Walk through contract details, payroll setup and company policies with HR.',
    category: 'welcome_admin',
    type: 'meeting',
    phase: 'day_1',
    ownerId: 'vanessa-koch',
    dueDate: '2026-05-04',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-04',
    comments: [],
  },
  {
    id: 'anna-team-introduction',
    templateId: 'team-introduction',
    title: 'Meet your team in a kickoff introduction',
    description: 'Join a short round-table so the team can introduce their roles and current projects.',
    category: 'team_org',
    type: 'meeting',
    phase: 'day_1',
    ownerId: 'markus-klein',
    buddyId: 'julia-schneider',
    dueDate: '2026-05-04',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-04',
    comments: [],
  },
  {
    id: 'anna-office-site-tour',
    templateId: 'office-site-tour',
    title: 'Take the office and site tour',
    description: 'Get shown around the office floor, meeting rooms, restaurant and badge access points.',
    category: 'welcome_admin',
    type: 'task',
    phase: 'day_1',
    ownerId: 'julia-schneider',
    dueDate: '2026-05-04',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-04',
    comments: [],
  },
  {
    id: 'anna-laptop-system-access',
    templateId: 'laptop-system-access',
    title: 'Receive laptop and core system access',
    description: 'Collect your laptop, badge, and get provisioned for email, intranet and core business systems.',
    category: 'it_tools',
    type: 'system_access',
    phase: 'day_1',
    ownerId: 'robert-schmitt',
    dueDate: '2026-05-04',
    priority: 'critical',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-04',
    comments: [],
  },
  {
    id: 'anna-email-calendar-setup',
    templateId: 'email-calendar-setup',
    title: 'Set up email, calendar and collaboration tools',
    description: 'Configure Outlook, Teams and shared calendars, and join your team channels.',
    category: 'it_tools',
    type: 'task',
    phase: 'day_1',
    ownerId: 'robert-schmitt',
    dueDate: '2026-05-04',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-04',
    comments: [],
  },
  {
    id: 'anna-org-chart-walkthrough',
    templateId: 'org-chart-walkthrough',
    title: 'Review the team and department org chart',
    description: 'Understand reporting lines, team structure and who owns which function.',
    category: 'team_org',
    type: 'reading',
    phase: 'first_week',
    ownerId: 'markus-klein',
    dueDate: '2026-05-06',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-06',
    comments: [],
  },
  {
    id: 'anna-key-stakeholders-mapping',
    templateId: 'key-stakeholders-mapping',
    title: 'Identify and meet key stakeholders',
    description: 'Build a first map of the people you will regularly work with across teams.',
    category: 'team_org',
    type: 'meeting',
    phase: 'first_week',
    ownerId: 'markus-klein',
    buddyId: 'julia-schneider',
    dueDate: '2026-05-07',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-07',
    comments: [],
  },
  {
    id: 'anna-first-team-meeting',
    templateId: 'first-team-meeting',
    title: 'Attend your first team meeting',
    description: 'Sit in on the regular team meeting to see current priorities and ways of working.',
    category: 'team_org',
    type: 'meeting',
    phase: 'first_week',
    ownerId: 'markus-klein',
    dueDate: '2026-05-08',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-08',
    comments: [],
  },
  {
    id: 'anna-coffee-chat-with-buddy',
    templateId: 'coffee-chat-with-buddy',
    title: 'Have a coffee chat with your buddy',
    description: 'Informal catch-up to ask the questions you would not ask in a formal meeting.',
    category: 'meetings_networking',
    type: 'meeting',
    phase: 'first_week',
    ownerId: 'julia-schneider',
    dueDate: '2026-05-08',
    priority: 'low',
    status: 'completed',
    mandatory: false,
    dependsOn: [],
    completedAt: '2026-05-08',
    comments: [],
  },
  {
    id: 'anna-vpn-remote-access-setup',
    templateId: 'vpn-remote-access-setup',
    title: 'Configure VPN and remote access',
    description: 'Install and test VPN access so you can work securely from outside the office.',
    category: 'it_tools',
    type: 'system_access',
    phase: 'first_week',
    ownerId: 'robert-schmitt',
    dueDate: '2026-05-11',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: ['anna-laptop-system-access'],
    completedAt: '2026-05-11',
    comments: [],
  },
  {
    id: 'anna-siemens-compliance-training',
    templateId: 'siemens-compliance-training',
    title: 'Complete Siemens compliance training',
    description: 'Mandatory training covering the Business Conduct Guidelines and anti-corruption principles.',
    category: 'compliance',
    type: 'training',
    phase: 'first_week',
    ownerId: 'vanessa-koch',
    dueDate: '2026-05-11',
    priority: 'critical',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-11',
    comments: [],
  },
  {
    id: 'anna-intro-smart-infrastructure',
    templateId: 'intro-smart-infrastructure',
    title: 'Get an introduction to Smart Infrastructure',
    description: 'Overview session on the Smart Infrastructure business, its divisions and strategic priorities.',
    category: 'smart_infrastructure',
    type: 'training',
    phase: 'first_week',
    ownerId: 'andrea-lang',
    dueDate: '2026-05-12',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-12',
    comments: [],
  },
  {
    id: 'anna-finance-org-overview',
    templateId: 'finance-org-overview',
    title: 'Review the finance organization overview',
    description: 'Get familiar with how the finance function is structured across controlling, reporting and business partnering.',
    category: 'finance_processes',
    type: 'reading',
    phase: 'first_week',
    ownerId: 'markus-klein',
    dueDate: '2026-05-13',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-13',
    comments: [],
  },
  {
    id: 'anna-sap-access-request',
    templateId: 'sap-access-request',
    title: 'Request SAP access',
    description: 'Submit and get approval for the SAP roles needed for your position.',
    category: 'systems_reporting',
    type: 'system_access',
    phase: 'first_week',
    ownerId: 'robert-schmitt',
    dueDate: '2026-05-13',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: ['anna-laptop-system-access'],
    completedAt: '2026-05-13',
    comments: [],
  },
  {
    id: 'anna-two-week-feedback-session',
    templateId: 'two-week-feedback-session',
    title: 'Attend the 2-week feedback session',
    description: 'Early check-in with your manager to surface questions and adjust the plan if needed.',
    category: 'first_30',
    type: 'meeting',
    phase: 'first_30',
    ownerId: 'markus-klein',
    dueDate: '2026-05-18',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-18',
    comments: [],
  },
  {
    id: 'anna-mandatory-elearning-package',
    templateId: 'mandatory-elearning-package',
    title: 'Complete the mandatory compliance e-learning package',
    description: 'Finish the full bundle of mandatory modules: compliance, data protection, IT security and safety.',
    category: 'compliance',
    type: 'training',
    phase: 'first_30',
    ownerId: 'vanessa-koch',
    dueDate: '2026-05-20',
    priority: 'critical',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-20',
    comments: [],
  },
  {
    id: 'anna-reporting-tools-overview',
    templateId: 'reporting-tools-overview',
    title: 'Get an overview of the reporting tools',
    description: "Introduction to the group reporting suite and the standard reports used by the team.",
    category: 'systems_reporting',
    type: 'training',
    phase: 'first_30',
    ownerId: 'julia-schneider',
    dueDate: '2026-05-21',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: ['anna-sap-access-request'],
    completedAt: '2026-05-21',
    comments: [],
  },
  {
    id: 'anna-monthly-closing-process',
    templateId: 'monthly-closing-process',
    title: 'Learn the monthly closing process',
    description: 'Understand the monthly closing calendar, key deliverables and the systems involved end to end.',
    category: 'finance_processes',
    type: 'procedure',
    phase: 'first_30',
    ownerId: 'julia-schneider',
    dueDate: '2026-05-25',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: ['anna-finance-org-overview'],
    completedAt: '2026-05-25',
    comments: [],
  },
  {
    id: 'anna-meeting-business-unit-controller',
    templateId: 'meeting-business-unit-controller',
    title: 'Meet the business unit controller',
    description: 'One-to-one introduction with the business unit controller you will partner with most closely.',
    category: 'meetings_networking',
    type: 'meeting',
    phase: 'first_30',
    ownerId: 'markus-klein',
    dueDate: '2026-05-26',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-26',
    comments: [],
  },
  {
    id: 'anna-forecast-process-walkthrough',
    templateId: 'forecast-process-walkthrough',
    title: 'Walk through the forecast process',
    description: 'Shadow how rolling forecasts are built and consolidated across business units.',
    category: 'finance_processes',
    type: 'procedure',
    phase: 'first_30',
    ownerId: 'julia-schneider',
    dueDate: '2026-05-28',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-28',
    comments: [],
  },
  {
    id: 'anna-budget-cycle-overview',
    templateId: 'budget-cycle-overview',
    title: 'Understand the annual budget cycle',
    description: 'Review how the annual budget is planned, negotiated and released across the organization.',
    category: 'finance_processes',
    type: 'reading',
    phase: 'first_30',
    ownerId: 'julia-schneider',
    dueDate: '2026-05-29',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-05-29',
    comments: [],
  },
  {
    id: 'anna-cost-center-structure',
    templateId: 'cost-center-structure',
    title: 'Study the cost center structure',
    description: 'Learn how cost centers are organized and how postings should be allocated correctly.',
    category: 'finance_processes',
    type: 'reading',
    phase: 'first_30',
    ownerId: 'julia-schneider',
    dueDate: '2026-06-01',
    priority: 'medium',
    status: 'completed',
    mandatory: true,
    dependsOn: [],
    completedAt: '2026-06-01',
    comments: [],
  },
  {
    id: 'anna-thirty-day-checkpoint',
    templateId: 'thirty-day-checkpoint',
    title: 'Complete the 30-day check-in',
    description: 'Formal review of progress, open questions and adjustments to the onboarding plan.',
    category: 'first_30',
    type: 'milestone',
    phase: 'first_30',
    ownerId: 'markus-klein',
    dueDate: '2026-06-03',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: ['anna-two-week-feedback-session'],
    completedAt: '2026-06-03',
    comments: [],
  },
  {
    id: 'anna-shadow-monthly-closing',
    templateId: 'shadow-monthly-closing',
    title: 'Shadow a monthly closing cycle',
    description: 'Sit alongside the team through a full monthly closing to see the process end to end in practice.',
    category: 'training',
    type: 'task',
    phase: 'first_60',
    ownerId: 'markus-klein',
    buddyId: 'julia-schneider',
    dueDate: '2026-06-18',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: ['anna-monthly-closing-process'],
    completedAt: '2026-06-18',
    comments: [
      {
        id: 'c-anna-shadow-closing-01',
        authorId: 'julia-schneider',
        text: "Great questions during the close — you're picking this up fast.",
        timestamp: '2026-06-18T16:20:00',
      },
    ],
  },
  {
    id: 'anna-finance-procedures-manual',
    templateId: 'finance-procedures-manual',
    title: 'Read the finance procedures manual',
    description: 'Reference guide covering approval limits, invoice handling and month-end checklists.',
    category: 'finance_processes',
    type: 'reading',
    phase: 'first_60',
    ownerId: 'julia-schneider',
    dueDate: '2026-06-23',
    priority: 'medium',
    status: 'not_started',
    mandatory: true,
    dependsOn: [],
    comments: [
      {
        id: 'c-anna-finance-manual-01',
        authorId: 'markus-klein',
        text: "Let's get this read before the next closing cycle — flagging as a priority.",
        timestamp: '2026-06-25T09:10:00',
      },
    ],
  },
  {
    id: 'anna-stakeholder-feedback-round',
    templateId: 'stakeholder-feedback-round',
    title: 'Collect feedback from key stakeholders',
    description: 'Ask two or three regular collaborators for informal feedback on ways of working so far.',
    category: 'first_60',
    type: 'task',
    phase: 'first_60',
    ownerId: 'markus-klein',
    dueDate: '2026-06-29',
    priority: 'low',
    status: 'blocked',
    mandatory: false,
    dependsOn: [],
    comments: [
      {
        id: 'c-anna-stakeholder-feedback-01',
        authorId: 'markus-klein',
        text: "On hold — the BU controller is out on leave until mid-July, we'll reschedule this.",
        timestamp: '2026-06-30T11:45:00',
      },
    ],
  },
  {
    id: 'anna-sixty-day-checkpoint',
    templateId: 'sixty-day-checkpoint',
    title: 'Complete the 60-day check-in',
    description: 'Review progress against your first-30 goals and set focus areas for the next stretch.',
    category: 'first_60',
    type: 'milestone',
    phase: 'first_60',
    ownerId: 'markus-klein',
    dueDate: '2026-07-03',
    priority: 'high',
    status: 'completed',
    mandatory: true,
    dependsOn: ['anna-thirty-day-checkpoint'],
    completedAt: '2026-07-03',
    comments: [],
  },
  {
    id: 'anna-independent-task-ownership',
    templateId: 'independent-task-ownership',
    title: 'Take ownership of a recurring task independently',
    description: 'Run a familiar recurring task end to end without supervision, with your buddy on standby.',
    category: 'first_60',
    type: 'task',
    phase: 'first_90',
    ownerId: 'markus-klein',
    dueDate: '2026-07-27',
    priority: 'medium',
    status: 'in_progress',
    mandatory: true,
    dependsOn: ['anna-shadow-monthly-closing'],
    comments: [],
  },
  {
    id: 'anna-development-plan-discussion',
    templateId: 'development-plan-discussion',
    title: 'Discuss your development plan with your manager',
    description: 'Agree on development priorities and training for the next two quarters.',
    category: 'first_90',
    type: 'meeting',
    phase: 'first_90',
    ownerId: 'markus-klein',
    dueDate: '2026-07-29',
    priority: 'medium',
    status: 'not_started',
    mandatory: true,
    dependsOn: [],
    comments: [],
  },
  {
    id: 'anna-ninety-day-checkpoint',
    templateId: 'ninety-day-checkpoint',
    title: 'Complete the 90-day check-in and review',
    description: 'Formal review closing the onboarding period, covering achievements, gaps and next steps.',
    category: 'first_90',
    type: 'milestone',
    phase: 'first_90',
    ownerId: 'markus-klein',
    dueDate: '2026-08-02',
    priority: 'high',
    status: 'not_started',
    mandatory: true,
    dependsOn: ['anna-sixty-day-checkpoint'],
    comments: [],
  },
];

const annaActivity: ActivityEntry[] = [
  { id: 'act-anna-01', journeyId: ANNA_ID, type: 'journey_created', actorId: 'markus-klein', message: 'Onboarding journey created for Anna Müller using the Finance template.', timestamp: '2026-04-20T10:00:00' },
  { id: 'act-anna-02', journeyId: ANNA_ID, type: 'task_completed', actorId: 'vanessa-koch', message: 'Employment contract and onboarding documents signed.', timestamp: '2026-04-29T14:30:00' },
  { id: 'act-anna-03', journeyId: ANNA_ID, type: 'task_completed', actorId: 'markus-klein', message: 'Completed welcome meeting on Day 1.', timestamp: '2026-05-04T09:15:00' },
  { id: 'act-anna-04', journeyId: ANNA_ID, type: 'task_completed', actorId: 'robert-schmitt', message: 'Laptop and core system access provisioned.', timestamp: '2026-05-04T11:00:00' },
  { id: 'act-anna-05', journeyId: ANNA_ID, type: 'task_completed', actorId: 'markus-klein', message: 'Attended first team meeting.', timestamp: '2026-05-08T15:00:00' },
  { id: 'act-anna-06', journeyId: ANNA_ID, type: 'task_completed', actorId: 'vanessa-koch', message: 'Completed Siemens compliance training.', timestamp: '2026-05-11T13:40:00' },
  { id: 'act-anna-07', journeyId: ANNA_ID, type: 'task_completed', actorId: 'robert-schmitt', message: 'SAP access granted.', timestamp: '2026-05-13T10:20:00' },
  { id: 'act-anna-08', journeyId: ANNA_ID, type: 'comment_added', actorId: 'markus-klein', message: 'Added a note after the 2-week feedback session — settling in well.', timestamp: '2026-05-18T16:00:00' },
  { id: 'act-anna-09', journeyId: ANNA_ID, type: 'task_completed', actorId: 'julia-schneider', message: 'Completed monthly closing process walkthrough.', timestamp: '2026-05-25T14:10:00' },
  { id: 'act-anna-10', journeyId: ANNA_ID, type: 'task_completed', actorId: 'markus-klein', message: '30-day check-in completed — on track.', timestamp: '2026-06-03T11:00:00' },
  { id: 'act-anna-11', journeyId: ANNA_ID, type: 'task_completed', actorId: 'julia-schneider', message: 'Finished shadowing the monthly closing cycle.', timestamp: '2026-06-18T16:30:00' },
  { id: 'act-anna-12', journeyId: ANNA_ID, type: 'reminder_sent', actorId: 'markus-klein', message: 'Sent a reminder to read the finance procedures manual.', timestamp: '2026-06-25T09:10:00' },
  { id: 'act-anna-13', journeyId: ANNA_ID, type: 'task_status_changed', actorId: 'markus-klein', message: "Marked 'Collect feedback from key stakeholders' as blocked — business unit controller on leave.", timestamp: '2026-06-30T11:45:00' },
  { id: 'act-anna-14', journeyId: ANNA_ID, type: 'task_completed', actorId: 'markus-klein', message: '60-day check-in completed.', timestamp: '2026-07-03T10:30:00' },
  { id: 'act-anna-15', journeyId: ANNA_ID, type: 'comment_added', actorId: 'julia-schneider', message: 'Left an encouraging note ahead of the 90-day review.', timestamp: '2026-07-20T09:00:00' },
];

const annaJourney: Journey = {
  id: ANNA_ID,
  employee: person('anna-mueller'),
  position: 'Financial Controller',
  department: 'Finance',
  team: 'Group Controlling',
  managerId: 'markus-klein',
  buddyId: 'julia-schneider',
  startDate: '2026-05-04',
  location: 'Erlangen, Germany',
  contractType: 'permanent',
  templateId: 'tpl-finance',
  status: 'on_track',
  tasks: annaTasks,
  activity: annaActivity,
};

// ===========================================================================
// The other 7 journeys — instantiated from templates with real variation.
// A small generator derives phase-appropriate due dates and a realistic
// status mix from the journey's start date measured against "today"; specific
// tasks can be forced into 'blocked' or left deliberately incomplete (which
// then reads as 'overdue' once the date has passed) to shape each story.
// ===========================================================================

const PHASE_BASE_OFFSET: Record<Phase, number> = {
  before_day_1: -5,
  day_1: 0,
  first_week: 2,
  first_30: 10,
  first_60: 32,
  first_90: 62,
};

const PHASE_SPACING: Record<Phase, number> = {
  before_day_1: 2,
  day_1: 0,
  first_week: 1,
  first_30: 2,
  first_60: 2,
  first_90: 2,
};

const GLOBAL_ROLES = {
  hr: 'vanessa-koch',
  it: 'robert-schmitt',
  trainer: 'andrea-lang',
  process_owner: 'vanessa-koch',
};

function roleMapFor(employeeId: Id, managerId: Id, buddyId: Id, financeId: Id = managerId): Record<DefaultOwnerRole, Id> {
  return {
    manager: managerId,
    buddy: buddyId,
    hr: GLOBAL_ROLES.hr,
    it: GLOBAL_ROLES.it,
    trainer: GLOBAL_ROLES.trainer,
    process_owner: GLOBAL_ROLES.process_owner,
    finance: financeId,
    team_lead: managerId,
    new_joiner: employeeId,
  };
}

interface BuildTasksOptions {
  journeyId: string;
  templateTaskIds: Id[];
  startDate: string;
  asOf: Date;
  roleMap: Record<DefaultOwnerRole, Id>;
  forceIncompleteIds?: Id[];
  forceBlockedIds?: Id[];
  commentsByTemplateId?: Record<string, Comment[]>;
}

function buildJourneyTasks(options: BuildTasksOptions): JourneyTask[] {
  const phaseCounters: Record<Phase, number> = {
    before_day_1: 0,
    day_1: 0,
    first_week: 0,
    first_30: 0,
    first_60: 0,
    first_90: 0,
  };
  const forceIncomplete = new Set(options.forceIncompleteIds ?? []);
  const forceBlocked = new Set(options.forceBlockedIds ?? []);

  return options.templateTaskIds.map((templateId, index) => {
    const template = taskLibrary.find((t) => t.id === templateId);
    if (!template) throw new Error(`Unknown task template id: ${templateId}`);

    const phase = template.recommendedPhase;
    const offset = PHASE_BASE_OFFSET[phase] + phaseCounters[phase] * PHASE_SPACING[phase];
    phaseCounters[phase] += 1;
    const dueDate = addDays(options.startDate, offset);
    const ownerId = options.roleMap[template.defaultOwnerRole];

    let status: TaskStatus;
    let completedAt: string | undefined;

    if (forceBlocked.has(templateId)) {
      status = 'blocked';
    } else if (forceIncomplete.has(templateId)) {
      status = 'in_progress';
    } else {
      const delta = daysBetween(dueDate, options.asOf);
      if (delta < -2) {
        status = 'completed';
        completedAt = dueDate;
      } else if (delta <= 2) {
        status = 'in_progress';
      } else {
        status = index % 2 === 0 ? 'not_started' : 'planned';
      }
    }

    return {
      id: `${options.journeyId}-${templateId}`,
      templateId,
      title: template.title,
      description: template.description,
      category: template.category,
      type: template.type,
      phase,
      ownerId,
      dueDate,
      priority: template.priority,
      status,
      mandatory: template.priority !== 'low',
      dependsOn: [],
      completedAt,
      comments: options.commentsByTemplateId?.[templateId] ?? [],
    };
  });
}

// --- Lukas Schneider — almost finished -----------------------------------

const lukasId = 'journey-lukas-schneider';
const lukasJourney: Journey = {
  id: lukasId,
  employee: person('lukas-schneider'),
  position: 'Project Manager',
  department: 'Project Management',
  team: 'Project Delivery',
  managerId: 'sabine-roth',
  buddyId: 'michael-zimmermann',
  startDate: '2026-04-13',
  location: 'München, Germany',
  contractType: 'permanent',
  templateId: 'tpl-project-manager',
  status: 'on_track',
  tasks: buildJourneyTasks({
    journeyId: lukasId,
    templateTaskIds: templateTaskIdsFor('tpl-project-manager'),
    startDate: '2026-04-13',
    asOf: TODAY,
    roleMap: roleMapFor('lukas-schneider', 'sabine-roth', 'michael-zimmermann'),
    forceIncompleteIds: ['onboarding-retrospective', 'development-plan-discussion'],
  }),
  activity: [
    { id: 'act-lukas-01', journeyId: lukasId, type: 'journey_created', actorId: 'sabine-roth', message: 'Onboarding journey created for Lukas Schneider using the Project Manager template.', timestamp: '2026-04-13T09:00:00' },
    { id: 'act-lukas-02', journeyId: lukasId, type: 'task_completed', actorId: 'sabine-roth', message: 'Completed welcome meeting and team introduction.', timestamp: '2026-04-13T15:00:00' },
    { id: 'act-lukas-03', journeyId: lukasId, type: 'task_completed', actorId: 'michael-zimmermann', message: 'Completed product portfolio deep dive.', timestamp: '2026-05-15T13:00:00' },
    { id: 'act-lukas-04', journeyId: lukasId, type: 'task_completed', actorId: 'sabine-roth', message: '60-day check-in completed — strong progress.', timestamp: '2026-06-12T10:30:00' },
    { id: 'act-lukas-05', journeyId: lukasId, type: 'reminder_sent', actorId: 'sabine-roth', message: 'Sent a reminder to wrap up the onboarding retrospective.', timestamp: '2026-07-20T09:00:00' },
  ],
};

// --- Sofia Becker — just starting -----------------------------------------

const sofiaId = 'journey-sofia-becker';
const sofiaJourney: Journey = {
  id: sofiaId,
  employee: person('sofia-becker'),
  position: 'Business Analyst',
  department: 'Performance Management',
  team: 'Performance Insights',
  managerId: 'thomas-bauer',
  buddyId: 'katharina-wolf',
  startDate: '2026-07-13',
  location: 'Karlsruhe, Germany',
  contractType: 'fixed_term',
  templateId: 'tpl-standard-employee',
  status: 'on_track',
  tasks: buildJourneyTasks({
    journeyId: sofiaId,
    templateTaskIds: templateTaskIdsFor('tpl-standard-employee'),
    startDate: '2026-07-13',
    asOf: TODAY,
    roleMap: roleMapFor('sofia-becker', 'thomas-bauer', 'katharina-wolf'),
  }),
  activity: [
    { id: 'act-sofia-01', journeyId: sofiaId, type: 'journey_created', actorId: 'thomas-bauer', message: 'Onboarding journey created for Sofia Becker using the Standard Employee template.', timestamp: '2026-07-08T10:00:00' },
    { id: 'act-sofia-02', journeyId: sofiaId, type: 'task_completed', actorId: 'thomas-bauer', message: 'Completed welcome meeting and laptop setup on Day 1.', timestamp: '2026-07-13T09:30:00' },
    { id: 'act-sofia-03', journeyId: sofiaId, type: 'task_completed', actorId: 'katharina-wolf', message: 'Completed office and site tour.', timestamp: '2026-07-15T11:00:00' },
    { id: 'act-sofia-04', journeyId: sofiaId, type: 'task_completed', actorId: 'thomas-bauer', message: 'Completed Siemens compliance training.', timestamp: '2026-07-20T14:00:00' },
  ],
};

// --- Jonas Weber — behind schedule -----------------------------------------

const jonasId = 'journey-jonas-weber';
const jonasJourney: Journey = {
  id: jonasId,
  employee: person('jonas-weber'),
  position: 'Systems Specialist',
  department: 'Digitalization',
  team: 'Digital Solutions',
  managerId: 'nina-krueger',
  buddyId: 'paul-hartmann',
  startDate: '2026-05-25',
  location: 'Erlangen, Germany',
  contractType: 'permanent',
  templateId: 'tpl-it-systems',
  status: 'at_risk',
  tasks: buildJourneyTasks({
    journeyId: jonasId,
    templateTaskIds: templateTaskIdsFor('tpl-it-systems'),
    startDate: '2026-05-25',
    asOf: TODAY,
    roleMap: roleMapFor('jonas-weber', 'nina-krueger', 'paul-hartmann'),
    forceBlockedIds: ['sap-access-request'],
    forceIncompleteIds: ['dashboard-access-setup', 'data-quality-guidelines', 'document-management-system-intro', 'sixty-day-checkpoint'],
    commentsByTemplateId: {
      'sap-access-request': [
        {
          id: 'c-jonas-sap-01',
          authorId: 'nina-krueger',
          text: 'Still stuck with IT security approval — following up again this week.',
          timestamp: '2026-07-15T10:00:00',
        },
      ],
    },
  }),
  activity: [
    { id: 'act-jonas-01', journeyId: jonasId, type: 'journey_created', actorId: 'nina-krueger', message: 'Onboarding journey created for Jonas Weber using the IT & Systems template.', timestamp: '2026-05-25T09:00:00' },
    { id: 'act-jonas-02', journeyId: jonasId, type: 'task_completed', actorId: 'robert-schmitt', message: 'Laptop and system access provisioned.', timestamp: '2026-05-25T10:30:00' },
    { id: 'act-jonas-03', journeyId: jonasId, type: 'comment_added', actorId: 'nina-krueger', message: 'Checking in — SAP access request is stuck with IT security, following up.', timestamp: '2026-06-20T13:00:00' },
    { id: 'act-jonas-04', journeyId: jonasId, type: 'reminder_sent', actorId: 'nina-krueger', message: 'Sent a reminder about overdue systems tasks.', timestamp: '2026-07-10T09:00:00' },
    { id: 'act-jonas-05', journeyId: jonasId, type: 'task_status_changed', actorId: 'nina-krueger', message: 'Flagged the journey as at risk pending SAP access.', timestamp: '2026-07-22T11:00:00' },
  ],
};

// --- Emma Fischer — blocked -------------------------------------------------

const emmaId = 'journey-emma-fischer';
const emmaJourney: Journey = {
  id: emmaId,
  employee: person('emma-fischer'),
  position: 'Commercial Project Manager',
  department: 'Project Management',
  team: 'Commercial Project Management',
  managerId: 'stefan-lehmann',
  buddyId: 'michael-zimmermann',
  startDate: '2026-05-11',
  location: 'Frankfurt am Main, Germany',
  contractType: 'permanent',
  templateId: 'tpl-project-manager',
  status: 'on_hold',
  tasks: buildJourneyTasks({
    journeyId: emmaId,
    templateTaskIds: templateTaskIdsFor('tpl-project-manager'),
    startDate: '2026-05-11',
    asOf: TODAY,
    roleMap: roleMapFor('emma-fischer', 'stefan-lehmann', 'michael-zimmermann'),
    forceBlockedIds: ['product-demo-session', 'independent-task-ownership'],
    forceIncompleteIds: ['stakeholder-feedback-round'],
    commentsByTemplateId: {
      'product-demo-session': [
        {
          id: 'c-emma-demo-01',
          authorId: 'stefan-lehmann',
          text: 'Blocked — the product specialist is unavailable until further notice, rescheduling once we hear back.',
          timestamp: '2026-07-05T10:00:00',
        },
      ],
    },
  }),
  activity: [
    { id: 'act-emma-01', journeyId: emmaId, type: 'journey_created', actorId: 'stefan-lehmann', message: 'Onboarding journey created for Emma Fischer using the Project Manager template.', timestamp: '2026-05-11T09:00:00' },
    { id: 'act-emma-02', journeyId: emmaId, type: 'task_completed', actorId: 'stefan-lehmann', message: 'Completed welcome meeting.', timestamp: '2026-05-11T14:00:00' },
    { id: 'act-emma-03', journeyId: emmaId, type: 'task_completed', actorId: 'michael-zimmermann', message: 'Completed product portfolio deep dive.', timestamp: '2026-06-10T11:00:00' },
    { id: 'act-emma-04', journeyId: emmaId, type: 'task_status_changed', actorId: 'stefan-lehmann', message: 'Marked the product demo session as blocked — specialist unavailable until further notice.', timestamp: '2026-07-05T10:00:00' },
    { id: 'act-emma-05', journeyId: emmaId, type: 'comment_added', actorId: 'stefan-lehmann', message: 'Following up with the product team to unblock the demo session.', timestamp: '2026-07-18T09:30:00' },
  ],
};

// --- David Wagner — steady progress -----------------------------------------

const davidId = 'journey-david-wagner';
const davidJourney: Journey = {
  id: davidId,
  employee: person('david-wagner'),
  position: 'Finance Business Partner',
  department: 'Finance',
  team: 'Finance Business Partnering',
  managerId: 'carsten-meier',
  buddyId: 'julia-schneider',
  startDate: '2026-06-08',
  location: 'München, Germany',
  contractType: 'permanent',
  templateId: 'tpl-finance',
  status: 'on_track',
  tasks: buildJourneyTasks({
    journeyId: davidId,
    templateTaskIds: templateTaskIdsFor('tpl-finance'),
    startDate: '2026-06-08',
    asOf: TODAY,
    roleMap: roleMapFor('david-wagner', 'carsten-meier', 'julia-schneider'),
    forceIncompleteIds: ['approval-workflow-overview'],
  }),
  activity: [
    { id: 'act-david-01', journeyId: davidId, type: 'journey_created', actorId: 'carsten-meier', message: 'Onboarding journey created for David Wagner using the Finance template.', timestamp: '2026-06-08T09:00:00' },
    { id: 'act-david-02', journeyId: davidId, type: 'task_completed', actorId: 'robert-schmitt', message: 'Laptop and core system access provisioned.', timestamp: '2026-06-08T10:15:00' },
    { id: 'act-david-03', journeyId: davidId, type: 'task_completed', actorId: 'julia-schneider', message: 'Completed monthly closing process walkthrough.', timestamp: '2026-06-20T14:00:00' },
    { id: 'act-david-04', journeyId: davidId, type: 'task_completed', actorId: 'carsten-meier', message: '30-day check-in completed.', timestamp: '2026-07-10T11:00:00' },
  ],
};

// --- Lena Hoffmann — not started yet -----------------------------------------

const lenaId = 'journey-lena-hoffmann';
const lenaJourney: Journey = {
  id: lenaId,
  employee: person('lena-hoffmann'),
  position: 'Data Analyst',
  department: 'Digitalization',
  team: 'Business Insights & Analytics',
  managerId: 'oliver-vogel',
  buddyId: 'katharina-wolf',
  startDate: '2026-08-10',
  location: 'Regensburg, Germany',
  contractType: 'working_student',
  templateId: 'tpl-it-systems',
  status: 'not_started',
  tasks: buildJourneyTasks({
    journeyId: lenaId,
    templateTaskIds: templateTaskIdsFor('tpl-it-systems'),
    startDate: '2026-08-10',
    asOf: TODAY,
    roleMap: roleMapFor('lena-hoffmann', 'oliver-vogel', 'katharina-wolf'),
  }),
  activity: [
    { id: 'act-lena-01', journeyId: lenaId, type: 'journey_created', actorId: 'oliver-vogel', message: "Onboarding journey created ahead of Lena's start date.", timestamp: '2026-07-10T09:00:00' },
    { id: 'act-lena-02', journeyId: lenaId, type: 'comment_added', actorId: 'oliver-vogel', message: 'Laptop ordered and desk assigned for the 10th.', timestamp: '2026-07-18T10:00:00' },
  ],
};

// --- Felix Richter — fully completed -----------------------------------------

const felixId = 'journey-felix-richter';
const felixJourney: Journey = {
  id: felixId,
  employee: person('felix-richter'),
  position: 'Portfolio Manager',
  department: 'Project Management',
  team: 'Portfolio Management',
  managerId: 'daniel-krause',
  buddyId: 'michael-zimmermann',
  startDate: '2026-02-16',
  location: 'Berlin, Germany',
  contractType: 'permanent',
  templateId: 'tpl-custom-journey',
  status: 'completed',
  tasks: buildJourneyTasks({
    journeyId: felixId,
    templateTaskIds: templateTaskIdsFor('tpl-custom-journey'),
    startDate: '2026-02-16',
    asOf: TODAY,
    roleMap: roleMapFor('felix-richter', 'daniel-krause', 'michael-zimmermann'),
  }),
  activity: [
    { id: 'act-felix-01', journeyId: felixId, type: 'journey_created', actorId: 'daniel-krause', message: 'Onboarding journey created for Felix Richter using the Custom Journey template.', timestamp: '2026-02-16T09:00:00' },
    { id: 'act-felix-02', journeyId: felixId, type: 'task_completed', actorId: 'daniel-krause', message: 'Completed welcome meeting.', timestamp: '2026-02-16T14:00:00' },
    { id: 'act-felix-03', journeyId: felixId, type: 'task_completed', actorId: 'daniel-krause', message: '30-day check-in completed.', timestamp: '2026-03-18T11:00:00' },
    { id: 'act-felix-04', journeyId: felixId, type: 'task_completed', actorId: 'daniel-krause', message: '60-day check-in completed.', timestamp: '2026-04-17T11:00:00' },
    { id: 'act-felix-05', journeyId: felixId, type: 'task_completed', actorId: 'daniel-krause', message: '90-day check-in completed — onboarding successfully closed out.', timestamp: '2026-05-17T11:00:00' },
  ],
};

export const journeys: Journey[] = [
  annaJourney,
  lukasJourney,
  sofiaJourney,
  jonasJourney,
  emmaJourney,
  davidJourney,
  lenaJourney,
  felixJourney,
];
