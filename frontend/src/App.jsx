import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./components/common/AdminLayout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfilePage from "./pages/ProfilePage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import UserManagementPage from "./pages/UserManagementPage";

// Member 1 — Uncomment when pages are ready:
// import ResourcesPage from './pages/ResourcesPage';

// Member 2
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
// import QRCheckInPage from './pages/QRCheckInPage';

// Member 3 — Uncomment when pages are ready:
// import TicketsPage from './pages/TicketsPage';
// import TicketDetailsPage from './pages/TicketDetailsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="app-container">
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* ── User routes ── */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Member 1 */}
            {/* <Route path="/resources" element={<ResourcesPage />} /> */}

            {/* Member 2 */}
            <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            {/* <Route path="/check-in" element={<QRCheckInPage />} /> */}

            {/* Member 3 */}
            {/* <Route path="/tickets" element={<TicketsPage />} /> */}
            {/* <Route path="/tickets/:id" element={<TicketDetailsPage />} /> */}

            {/* ── Admin routes — persistent sidebar layout ── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<UserManagementPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />

              {/* Member 1 — add when ready: */}
              {/* <Route path="resources" element={<AdminResourcesPage />} /> */}

              {/* Member 2 */}
              <Route path="bookings" element={<AdminBookingsPage />} />

              {/* Member 3 — add when ready: */}
              {/* <Route path="tickets" element={<AdminTicketsPage />} /> */}
            </Route>

          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={4000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;