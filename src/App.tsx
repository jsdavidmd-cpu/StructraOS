import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ProjectContextProvider } from './components/ProjectContextProvider';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard & Layout
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectList from './pages/Projects/ProjectList';
import ProjectWizard from './pages/Projects/ProjectWizard';
import ProjectDashboard from './pages/Projects/ProjectDashboard';
import ProjectEngineeringToolsPage from './pages/Projects/ProjectEngineeringToolsPage';
import TemplatesLibraryPage from './pages/TemplatesLibraryPage';
import ReportsPage from './pages/ReportsPage';
import AdministrationPage from './pages/AdministrationPage';
import DocumentsPage from './pages/DocumentsPage';

// Estimator Module
import EstimatesPage from './pages/estimator/EstimatesPage';
import EstimateDetailPage from './pages/estimator/EstimateDetailPage';
import AssembliesPage from './pages/estimator/AssembliesPage';
import AssemblyDetailPage from './pages/estimator/AssemblyDetailPage';
import EnhancedBOQEditorPage from './pages/estimator/EnhancedBOQEditorPage';
import BarSchedulePage from './pages/estimator/BarSchedulePage';
import FormworkReusePage from './pages/estimator/FormworkReusePage';
import VerticalBOQPage from './pages/estimator/VerticalBOQPage';

// Manpower Module
import ManpowerPage from './pages/manpower/ManpowerPage';
import AttendancePage from './pages/manpower/AttendancePage';

// Daily Logbook
import DailyLogbookPage from './pages/logbook/DailyLogbookPage';

// Other Modules (Placeholders)
import InventoryPage from './pages/inventory/InventoryPage';
import SchedulePage from './pages/schedule/SchedulePage';
import ProgressPage from './pages/progress/ProgressPage';

import './index.css';

function App() {
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    authService.initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing STRUCTRA...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProjectContextProvider>
                <DashboardLayout />
              </ProjectContextProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Global Sidebar Routes */}
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectWizard />} />
          <Route path="templates" element={<TemplatesLibraryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="administration" element={<AdministrationPage />} />
          
          {/* Legacy Global Module Routes */}
          <Route path="boq/vertical" element={<VerticalBOQPage />} />
          <Route path="estimates" element={<EstimatesPage />} />
          <Route path="estimates/:id" element={<EstimateDetailPage />} />
          <Route path="estimates/:id/boq" element={<EnhancedBOQEditorPage />} />
          <Route path="estimates/:id/bar-schedule" element={<BarSchedulePage />} />
          <Route path="assemblies" element={<AssembliesPage />} />
          <Route path="assemblies/:id" element={<AssemblyDetailPage />} />
          <Route path="formwork-reuse" element={<FormworkReusePage />} />
          
          {/* Manpower */}
          <Route path="manpower" element={<ManpowerPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          
          {/* Daily Logbook */}
          <Route path="logbook" element={<DailyLogbookPage />} />
          
          {/* Other Modules */}
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="documents" element={<DocumentsPage />} />

          {/* Project-Scoped Routes */}
          <Route path="projects/:projectId" element={<Navigate to="overview" replace />} />
          <Route path="projects/:projectId/overview" element={<ProjectDashboard />} />

          <Route path="projects/:projectId/boq/vertical" element={<VerticalBOQPage />} />
          <Route path="projects/:projectId/estimates" element={<EstimatesPage />} />
          <Route path="projects/:projectId/estimates/:id" element={<EstimateDetailPage />} />
          <Route path="projects/:projectId/estimates/:id/boq" element={<EnhancedBOQEditorPage />} />
          <Route path="projects/:projectId/estimates/:id/bar-schedule" element={<BarSchedulePage />} />

          <Route path="projects/:projectId/schedule" element={<SchedulePage />} />
          <Route path="projects/:projectId/manpower" element={<ManpowerPage />} />
          <Route path="projects/:projectId/attendance" element={<AttendancePage />} />
          <Route path="projects/:projectId/inventory" element={<InventoryPage />} />
          <Route path="projects/:projectId/progress" element={<ProgressPage />} />
          <Route path="projects/:projectId/documents" element={<DocumentsPage />} />
          <Route path="projects/:projectId/logbook" element={<DailyLogbookPage />} />
          <Route path="projects/:projectId/tools" element={<ProjectEngineeringToolsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
