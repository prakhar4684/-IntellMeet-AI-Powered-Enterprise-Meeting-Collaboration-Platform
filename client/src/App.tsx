import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

// 24 Application Pages
import { LandingPage } from './pages/LandingPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MeetingsListPage } from './pages/MeetingsListPage';
import { CreateMeetingPage } from './pages/CreateMeetingPage';
import { MeetingLobbyPage } from './pages/MeetingLobbyPage';
import { LiveMeetingRoomPage } from './pages/LiveMeetingRoomPage';
import { MeetingHistoryPage } from './pages/MeetingHistoryPage';
import { PostMeetingReportPage } from './pages/PostMeetingReportPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { WorkspaceDetailsPage } from './pages/WorkspaceDetailsPage';
import { TeamMembersPage } from './pages/TeamMembersPage';
import { KanbanTaskBoardPage } from './pages/KanbanTaskBoardPage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Platform Pages */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meetings" element={<MeetingsListPage />} />
          <Route path="/meetings/new" element={<CreateMeetingPage />} />
          <Route path="/meetings/:code/lobby" element={<MeetingLobbyPage />} />
          <Route path="/room/:code" element={<LiveMeetingRoomPage />} />
          <Route path="/history" element={<MeetingHistoryPage />} />
          <Route path="/report/:code" element={<PostMeetingReportPage />} />
          <Route path="/ai-assistant" element={<AiAssistantPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/workspaces/:id" element={<WorkspaceDetailsPage />} />
          <Route path="/members" element={<TeamMembersPage />} />
          <Route path="/tasks" element={<KanbanTaskBoardPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
