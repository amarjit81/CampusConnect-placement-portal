import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LandingPage from "./pages/shared/LandingPage";
import LoginPage from "./pages/shared/LoginPage";
import NotFoundPage from "./pages/shared/NotFoundPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddOpportunityPage from "./pages/admin/AddOpportunityPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import BookmarksPage from "./pages/student/BookmarksPage";
import ApplicationTrackerPage from "./pages/student/ApplicationTrackerPage";
import UpcomingEventsPage from "./pages/student/UpcomingEventsPage";
import OpportunitiesPage from "./pages/shared/OpportunitiesPage";
import OpportunityDetailsPage from "./pages/shared/OpportunityDetailsPage";
import AnnouncementsPage from "./pages/shared/AnnouncementsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="opportunities/new" element={<AddOpportunityPage />} />
          <Route
            path="opportunities/:id"
            element={<OpportunityDetailsPage />}
          />
          <Route
            path="announcements"
            element={<AdminAnnouncementsPage />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="student" />}>
        <Route path="/student" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route
            path="opportunities/:id"
            element={<OpportunityDetailsPage />}
          />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="tracker" element={<ApplicationTrackerPage />} />
          <Route path="events" element={<UpcomingEventsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
