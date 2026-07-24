import { Route, Routes } from 'react-router-dom';
import { useViewerRole } from './lib/store';
import { Dashboard } from './pages/Dashboard';
import { JourneysList } from './pages/JourneysList';
import { TaskLibrary } from './pages/TaskLibrary';
import { OnboardingPass } from './pages/OnboardingPass';
import { MyAssignedTasks } from './pages/MyAssignedTasks';
import { Templates } from './pages/Templates';
import { Analytics } from './pages/Analytics';
import { JourneyDetail } from './pages/journey-detail/JourneyDetail';
import { CreateJourneyWizard } from './pages/create-journey/CreateJourneyWizard';

// New Joiner viewpoint: the Pass is the home screen instead of the Dashboard.
function Home() {
  const viewerRole = useViewerRole();
  return viewerRole === 'new_joiner' ? <OnboardingPass /> : <Dashboard />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/journeys" element={<JourneysList />} />
      <Route path="/journeys/new" element={<CreateJourneyWizard />} />
      <Route path="/journeys/:id" element={<JourneyDetail />} />
      <Route path="/library" element={<TaskLibrary />} />
      <Route path="/pass" element={<OnboardingPass />} />
      <Route path="/my-tasks" element={<MyAssignedTasks />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}
