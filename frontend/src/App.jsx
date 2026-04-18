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
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ProfilePage from "./pages/ProfilePage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import UserManagementPage from "./pages/UserManagementPage";
import AuditLogPage from "./pages/AuditLogPage";
import ResourcesPage from './pages/ResourcesPage';
import BookingFormPage from "./pages/BookingFormPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import QRCheckInPage from "./pages/QRCheckInPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import TechnicianDashboard from "./pages/TechnicianDashboard";

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
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            <Route path="/check-in" element={<QRCheckInPage />} />

            {/* ── User routes ── */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/overview" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Member 1 */}
            <Route path="/resources" element={<ResourcesPage />} />

            {/* Member 2 */}
            <Route path="/bookings/new" element={<ProtectedRoute><BookingFormPage /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />

            {/* Member 3 */}
            <Route path="/tickets/new" element={<ProtectedRoute><CreateTicketPage /></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
            <Route path="/technician" element={<ProtectedRoute><TechnicianDashboard /></ProtectedRoute>} />

            {/* ── Admin routes ── */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route path="audit-log" element={<ProtectedRoute adminOnly><AuditLogPage /></ProtectedRoute>} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="tickets" element={<ProtectedRoute adminOnly><AdminTicketsPage /></ProtectedRoute>} />
              <Route path="tickets/:id" element={<ProtectedRoute adminOnly><TicketDetailPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={4000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;