import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddNotePage from './pages/AddNotePage';
import TestNotificationPage from './pages/TestNotificationPage';
import TaskDetailPage from './pages/TaskDetailPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-note"
              element={
                <ProtectedRoute>
                  <AddNotePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-notifications"
              element={
                <ProtectedRoute>
                  <TestNotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task/:taskId"
              element={
                <ProtectedRoute>
                  <TaskDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
