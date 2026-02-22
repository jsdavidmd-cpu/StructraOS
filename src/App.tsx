import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard & Layout
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';

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
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          
          {/* Estimator */}
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
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
