import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import Header from './components/Layout/Header';
import MobileTabBar from './components/Layout/MobileTabBar';
import FloatingActionButton from './components/Layout/FloatingActionButton';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AddNotePage from './pages/AddNotePage';
import TestNotificationPage from './pages/TestNotificationPage';
import TestEdgeFunctionPage from './pages/TestEdgeFunctionPage';
import TaskDetailPage from './pages/TaskDetailPage';
import MeetingNoteDetailPage from './pages/MeetingNoteDetailPage';
import ProfilePage from './pages/ProfilePage';
import UpdatesPage from './pages/UpdatesPage';


// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

function AnimatedRoutes() {
  const location = useLocation();

  // Define top-level tabs where transitions should be disabled
  const topLevelRoutes = ['/dashboard', '/updates', '/profile', '/add-note'];
  const isTopLevel = topLevelRoutes.includes(location.pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <motion.div
                variants={isTopLevel ? {} : pageVariants}
                initial={isTopLevel ? "initial" : "initial"}
                animate={isTopLevel ? "animate" : "animate"}
                exit={isTopLevel ? undefined : "exit"}
                transition={isTopLevel ? { duration: 0 } : undefined}
              >
                <DashboardPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-note"
          element={
            <ProtectedRoute>
              <motion.div
                variants={isTopLevel ? {} : pageVariants}
                initial={isTopLevel ? "initial" : "initial"}
                animate={isTopLevel ? "animate" : "animate"}
                exit={isTopLevel ? undefined : "exit"}
                transition={isTopLevel ? { duration: 0 } : undefined}
              >
                <AddNotePage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-notifications"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <TestNotificationPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-edge-function"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <TestEdgeFunctionPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/task/:taskId"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <TaskDetailPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/note/:noteId"
          element={
            <ProtectedRoute>
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <MeetingNoteDetailPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <motion.div
                variants={isTopLevel ? {} : pageVariants}
                initial={isTopLevel ? "initial" : "initial"}
                animate={isTopLevel ? "animate" : "animate"}
                exit={isTopLevel ? undefined : "exit"}
                transition={isTopLevel ? { duration: 0 } : undefined}
              >
                <ProfilePage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/updates"
          element={
            <ProtectedRoute>
              <motion.div
                variants={isTopLevel ? {} : pageVariants}
                initial={isTopLevel ? "initial" : "initial"}
                animate={isTopLevel ? "animate" : "animate"}
                exit={isTopLevel ? undefined : "exit"}
                transition={isTopLevel ? { duration: 0 } : undefined}
              >
                <UpdatesPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

import ScrollToTop from './components/ScrollToTop';
import ScrollToTopOnMount from './components/ScrollToTopOnMount';

// ... (existing imports)

// import { useStatusBar } from './hooks/useStatusBar'; // Moved to ThemeContext
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/reset-password'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-luxury-paper-light dark:bg-luxury-paper-dark text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
      {/* Android Status Bar Spacer */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-luxury-paper-light dark:bg-luxury-paper-dark transition-colors duration-300"
        style={{ height: 'env(safe-area-inset-top, 24px)' }}
      />

      {/* Main Content Container */}
      <div
        className="min-h-screen pt-[calc(max(env(safe-area-inset-top),48px)+64px)] md:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom,16px))] md:pb-4"
      >
        <ScrollToTopOnMount />
        <Header />
        <ToastContainer />
        <AnimatedRoutes />
        {!isAuthPage && (
          <>
            <MobileTabBar />
            <FloatingActionButton />
          </>
        )}
        <ScrollToTop />
      </div>
    </div>
  );
}

function App() {
  // useStatusBar(); // Managed by ThemeContext now

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
