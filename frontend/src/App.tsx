import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import PatientLayout from '@/layouts/PatientLayout';
import StaffLayout from '@/layouts/StaffLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import PatientDashboard from '@/pages/patient/Dashboard';
import HospitalDirectory from '@/pages/HospitalDirectory';
import VisitPlanner from '@/pages/patient/VisitPlanner';
import RequestAssistance from '@/pages/patient/RequestAssistance';
import MyRequests from '@/pages/patient/MyRequests';
import RequestDetail from '@/pages/patient/RequestDetail';
import FeedbackPage from '@/pages/patient/FeedbackPage';
import FAQAssistant from '@/pages/FAQAssistant';
import ProfilePage from '@/pages/ProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import StaffDashboard from '@/pages/staff/StaffDashboard';
import StaffRequests from '@/pages/staff/StaffRequests';
import StaffRequestDetail from '@/pages/staff/StaffRequestDetail';
import StaffAnalytics from '@/pages/staff/StaffAnalytics';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStaff from '@/pages/admin/AdminStaff';
import AdminDepartments from '@/pages/admin/AdminDepartments';
import AdminFAQs from '@/pages/admin/AdminFAQs';
import AdminAudit from '@/pages/admin/AdminAudit';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-sm text-text-secondary mb-4">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontSize: '14px' },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/hospital-directory" element={<HospitalDirectory />} />
              <Route path="/faqs" element={<FAQAssistant />} />
              <Route path="/faq-assistant" element={<FAQAssistant />} />
            </Route>

            {/* Patient routes */}
            <Route element={<PatientLayout />}>
              <Route path="/dashboard" element={<PatientDashboard />} />
              <Route path="/visit-planner" element={<VisitPlanner />} />
              <Route path="/request-assistance" element={<RequestAssistance />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/my-requests/:id" element={<RequestDetail />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Staff routes */}
            <Route element={<StaffLayout />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/requests" element={<StaffRequests />} />
              <Route path="/staff/requests/:id" element={<StaffRequestDetail />} />
              <Route path="/staff/analytics" element={<StaffAnalytics />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/faqs" element={<AdminFAQs />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
