import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { DemoInbox } from './components/common/DemoInbox';

// Public & Student Pages
import { LandingPage } from './pages/LandingPage';
import { CoursesListPage } from './pages/student/CoursesListPage';
import { CourseDetailPage } from './pages/student/CourseDetailPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LessonPlayerPage } from './pages/student/LessonPlayerPage';
import { MyAccountPage } from './pages/student/MyAccountPage';
import { AccessExpiredPage } from './pages/student/AccessExpiredPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Staff (admin + supervisor) Pages
import { AdminLayout } from './layouts/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminAccessKeys } from './pages/admin/AdminAccessKeys';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminStaff } from './pages/admin/AdminStaff';
import { StaffAccountPage } from './pages/admin/StaffAccountPage';

/** Admin and supervisor. */
const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isStaff } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isStaff) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

/** Admin only (settings, staff accounts). */
const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
};

/** Students only: signed in with an access key. Staff go to their own dashboard. */
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isStaff } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (isStaff) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const MainLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isPlayerPath = location.pathname.includes('/lesson/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {!isAdminPath && !isPlayerPath && <Navbar />}
      <div className="flex-1">{children}</div>
      {!isAdminPath && !isPlayerPath && <BottomNav />}
      <DemoInbox />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <MainLayoutWrapper>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CoursesListPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Student (access key) */}
              <Route path="/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
              <Route path="/courses/:courseId/lesson/:lessonId" element={<StudentRoute><LessonPlayerPage /></StudentRoute>} />
              <Route path="/account" element={<StudentRoute><MyAccountPage /></StudentRoute>} />
              <Route path="/access-expired" element={<StudentRoute><AccessExpiredPage /></StudentRoute>} />

              {/* Staff: admin + supervisor */}
              <Route path="/admin" element={<StaffRoute><AdminLayout /></StaffRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="keys" element={<AdminAccessKeys />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="account" element={<StaffAccountPage />} />
                <Route path="settings" element={<AdminOnly><AdminSettings /></AdminOnly>} />
                <Route path="staff" element={<AdminOnly><AdminStaff /></AdminOnly>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayoutWrapper>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
