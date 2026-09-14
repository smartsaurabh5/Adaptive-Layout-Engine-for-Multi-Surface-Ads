import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import LayoutEditorPage from '@/pages/LayoutEditorPage';
import MultiSurfacePreviewPage from '@/pages/MultiSurfacePreviewPage';
import AssetsLibraryPage from '@/pages/AssetsLibraryPage';
import SurfacesPage from '@/pages/SurfacesPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/editor" element={<LayoutEditorPage />} />
            <Route path="/editor/:id" element={<LayoutEditorPage />} />
            <Route path="/preview" element={<MultiSurfacePreviewPage />} />
            <Route path="/preview/:id" element={<MultiSurfacePreviewPage />} />
            <Route path="/assets" element={<AssetsLibraryPage />} />
            <Route path="/surfaces" element={<SurfacesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<SettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
