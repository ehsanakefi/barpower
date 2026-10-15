import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import LoadData from '@/pages/LoadData';
import TemporalConstraints from '@/pages/TemporalConstraints';
import FeederRelations from '@/pages/FeederRelations';
import WeeklyCalculation from '@/pages/WeeklyCalculation';
import ScheduleViewer from '@/pages/ScheduleViewer';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import {
  AdminOverview,
  CompaniesManagement,
  GlobalScheduleRuns,
  GlobalUsers,
} from '@/pages/SuperAdmin';
import { seedDemoData } from '@/services/mockService';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function AppInit() {
  useEffect(() => {
    seedDemoData().catch(console.error);
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit />
        <Routes>
          <Route element={<SuperAdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="companies" element={<CompaniesManagement />} />
            <Route path="users" element={<GlobalUsers />} />
            <Route path="runs" element={<GlobalScheduleRuns />} />
            <Route path="explorer" element={<GlobalScheduleRuns explorerMode />} />
            <Route path="settings" element={<GlobalUsers settingsMode />} />
          </Route>
          <Route path="tenant" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="load-data" element={<LoadData />} />
            <Route path="temporal-constraints" element={<TemporalConstraints />} />
            <Route path="feeder-relations" element={<FeederRelations />} />
            <Route path="calculation" element={<WeeklyCalculation />} />
            <Route path="schedule" element={<ScheduleViewer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
