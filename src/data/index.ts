import { people } from './people';
import { taskLibrary } from './taskLibrary';
import { templates } from './templates';
import { journeys } from './journeys';

export { people } from './people';
export { taskLibrary } from './taskLibrary';
export { templates } from './templates';
export { journeys } from './journeys';

export interface Seed {
  people: typeof people;
  taskLibrary: typeof taskLibrary;
  templates: typeof templates;
  journeys: typeof journeys;
}

export const seed: Seed = {
  people,
  taskLibrary,
  templates,
  journeys,
};
