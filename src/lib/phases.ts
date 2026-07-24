import type { Phase } from '../types';

export const PHASE_ORDER: Phase[] = ['before_day_1', 'day_1', 'first_week', 'first_30', 'first_60', 'first_90'];

export const PHASE_LABEL: Record<Phase, string> = {
  before_day_1: 'Before Day 1',
  day_1: 'Day 1',
  first_week: 'First Week',
  first_30: 'First 30 Days',
  first_60: 'First 60 Days',
  first_90: 'First 90 Days',
};

// Single default offset (in days from the journey's start date) used to seed
// a sensible due date when a task is first added — editable afterwards.
export const PHASE_DEFAULT_OFFSET: Record<Phase, number> = {
  before_day_1: -3,
  day_1: 0,
  first_week: 4,
  first_30: 20,
  first_60: 45,
  first_90: 75,
};
