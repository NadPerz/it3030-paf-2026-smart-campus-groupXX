import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Member 1 — Uncomment when pages are ready:
// import ResourcesPage from './pages/ResourcesPage';

// Member 2 — Uncomment when pages are ready:
// import BookingPage from './pages/BookingPage';
// import MyBookingsPage from './pages/MyBookingsPage';
// import AdminBookingsPage from './pages/AdminBookingsPage';
// import QRCheckInPage from './pages/QRCheckInPage';

// Member 3 — Uncomment when pages are ready:
// import TicketsPage from './pages/TicketsPage';
// import TicketDetailsPage from './pages/TicketDetailsPage';

// Member 4 — Uncomment when pages are ready:
// import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Member 1 — Resources */}
            {/* <Route path="/resources" element={<ResourcesPage />} /> */}

            {/* Member 2 — Bookings */}
            {/* <Route path="/bookings" element={<BookingPage />} /> */}
            {/* <Route path="/bookings/my" element={<MyBookingsPage />} /> */}
            {/* <Route path="/admin/bookings" element={<AdminBookingsPage />} /> */}
            {/* <Route path="/check-in" element={<QRCheckInPage />} /> */}

            {/* Member 3 — Tickets */}
            {/* <Route path="/tickets" element={<TicketsPage />} /> */}
            {/* <Route path="/tickets/:id" element={<TicketDetailsPage />} /> */}

            {/* Member 4 — Notifications */}
            {/* <Route path="/notifications" element={<NotificationsPage />} /> */}
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={4000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
