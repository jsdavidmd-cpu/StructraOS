import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ProjectContextProvider } from './components/ProjectContextProvider';

// Auth Pages (eager load for login)
import LoginPage from './pages/auth/LoginPage';

// Dashboard & Layout (eager load for initial render)
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDashboard from './pages/Projects/ProjectDashboard';

// Lazy-loaded components for better performance
// Projects
const ProjectWizard = lazy(() => import('./pages/Projects/ProjectWizard'));
const ProjectEngineeringToolsPage = lazy(() => import('./pages/Projects/ProjectEngineeringToolsPage'));

// Admin & Reports
const TemplatesLibraryPage = lazy(() => import('./pages/TemplatesLibraryPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AdministrationPage = lazy(() => import('./pages/AdministrationPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));

// Estimator Module (heavy components)
const EstimatesPage = lazy(() => import('./pages/estimator/EstimatesPage'));
const EstimateDetailPage = lazy(() => import('./pages/estimator/EstimateDetailPage'));
const AssembliesPage = lazy(() => import('./pages/estimator/AssembliesPage'));
const AssemblyDetailPage = lazy(() => import('./pages/estimator/AssemblyDetailPage'));
const EnhancedBOQEditorPage = lazy(() => import('./pages/estimator/EnhancedBOQEditorPage'));
const BarSchedulePage = lazy(() => import('./pages/estimator/BarSchedulePage'));
const FormworkReusePage = lazy(() => import('./pages/estimator/FormworkReusePage'));
const VerticalBOQPage = lazy(() => import('./pages/estimator/VerticalBOQPage'));

// Manpower Module
const ManpowerPage = lazy(() => import('./pages/manpower/ManpowerPage'));
const AttendancePage = lazy(() => import('./pages/manpower/AttendancePage'));

// Daily Logbook
const DailyLogbookPage = lazy(() => import('./pages/logbook/DailyLogbookPage'));

// Other Modules (heavy with charts and complex features)
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const SchedulePage = lazy(() => import('./pages/schedule/SchedulePage'));
const ProgressPage = lazy(() => import('./pages/progress/ProgressPage'));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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

          {/* Wrap lazy-loaded routes in Suspense */}

          {/* Global Sidebar Routes */}
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<Suspense fallback={<PageLoader />}><ProjectWizard /></Suspense>} />
          <Route path="templates" element={<Suspense fallback={<PageLoader />}><TemplatesLibraryPage /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
          <Route path="administration" element={<Suspense fallback={<PageLoader />}><AdministrationPage /></Suspense>} />
          
          {/* Legacy Global Module Routes (lazy loaded) */}
          <Route path="boq/vertical" element={<Suspense fallback={<PageLoader />}><VerticalBOQPage /></Suspense>} />
          <Route path="estimates" element={<Suspense fallback={<PageLoader />}><EstimatesPage /></Suspense>} />
          <Route path="estimates/:id" element={<Suspense fallback={<PageLoader />}><EstimateDetailPage /></Suspense>} />
          <Route path="estimates/:id/boq" element={<Suspense fallback={<PageLoader />}><EnhancedBOQEditorPage /></Suspense>} />
          <Route path="estimates/:id/bar-schedule" element={<Suspense fallback={<PageLoader />}><BarSchedulePage /></Suspense>} />
          <Route path="assemblies" element={<Suspense fallback={<PageLoader />}><AssembliesPage /></Suspense>} />
          <Route path="assemblies/:id" element={<Suspense fallback={<PageLoader />}><AssemblyDetailPage /></Suspense>} />
          <Route path="formwork-reuse" element={<Suspense fallback={<PageLoader />}><FormworkReusePage /></Suspense>} />
          
          {/* Manpower (lazy loaded) */}
          <Route path="manpower" element={<Suspense fallback={<PageLoader />}><ManpowerPage /></Suspense>} />
          <Route path="attendance" element={<Suspense fallback={<PageLoader />}><AttendancePage /></Suspense>} />
          
          {/* Daily Logbook (lazy loaded) */}
          <Route path="logbook" element={<Suspense fallback={<PageLoader />}><DailyLogbookPage /></Suspense>} />
          
          {/* Other Modules (lazy loaded) */}
          <Route path="inventory" element={<Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>} />
          <Route path="schedule" element={<Suspense fallback={<PageLoader />}><SchedulePage /></Suspense>} />
          <Route path="progress" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
          <Route path="documents" element={<Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense>} />

          {/* Project-Scoped Routes (lazy loaded) */}
          <Route path="projects/:projectId" element={<Navigate to="overview" replace />} />
          <Route path="projects/:projectId/overview" element={<ProjectDashboard />} />

          <Route path="projects/:projectId/boq/vertical" element={<Suspense fallback={<PageLoader />}><VerticalBOQPage /></Suspense>} />
          <Route path="projects/:projectId/estimates" element={<Suspense fallback={<PageLoader />}><EstimatesPage /></Suspense>} />
          <Route path="projects/:projectId/estimates/:id" element={<Suspense fallback={<PageLoader />}><EstimateDetailPage /></Suspense>} />
          <Route path="projects/:projectId/estimates/:id/boq" element={<Suspense fallback={<PageLoader />}><EnhancedBOQEditorPage /></Suspense>} />
          <Route path="projects/:projectId/estimates/:id/bar-schedule" element={<Suspense fallback={<PageLoader />}><BarSchedulePage /></Suspense>} />

          <Route path="projects/:projectId/schedule" element={<Suspense fallback={<PageLoader />}><SchedulePage /></Suspense>} />
          <Route path="projects/:projectId/manpower" element={<Suspense fallback={<PageLoader />}><ManpowerPage /></Suspense>} />
          <Route path="projects/:projectId/attendance" element={<Suspense fallback={<PageLoader />}><AttendancePage /></Suspense>} />
          <Route path="projects/:projectId/inventory" element={<Suspense fallback={<PageLoader />}><InventoryPage /></Suspense>} />
          <Route path="projects/:projectId/progress" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
          <Route path="projects/:projectId/documents" element={<Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense>} />
          <Route path="projects/:projectId/logbook" element={<Suspense fallback={<PageLoader />}><DailyLogbookPage /></Suspense>} />
          <Route path="projects/:projectId/tools" element={<Suspense fallback={<PageLoader />}><ProjectEngineeringToolsPage /></Suspense>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
