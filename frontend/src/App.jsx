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
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import QRCheckInPage from "./pages/QRCheckInPage";

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
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />

            {/* ── Admin routes ── */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route path="audit-log" element={<ProtectedRoute adminOnly><AuditLogPage /></ProtectedRoute>} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
            </Route>
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={4000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;