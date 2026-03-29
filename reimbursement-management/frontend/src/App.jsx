import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLayout from './pages/admin/AdminLayout';
import ManagerLayout from './pages/manager/ManagerLayout';
import DirectorLayout from './pages/director/DirectorLayout';
import EmployeeLayout from './pages/employee/EmployeeLayout';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}><div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%' }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'director') return <Navigate to="/director" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/employee" replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      } />

      <Route path="/manager/*" element={
        <ProtectedRoute allowedRoles={['manager', 'admin']}>
          <ManagerLayout />
        </ProtectedRoute>
      } />

      <Route path="/director/*" element={
        <ProtectedRoute allowedRoles={['director', 'admin']}>
          <DirectorLayout />
        </ProtectedRoute>
      } />

      <Route path="/employee/*" element={
        <ProtectedRoute allowedRoles={['employee', 'manager', 'director', 'admin']}>
          <EmployeeLayout />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px' },
            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
          }} 
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
