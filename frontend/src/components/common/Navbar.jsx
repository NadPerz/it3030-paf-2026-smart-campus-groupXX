import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

/**
 * Top navigation bar — shared across all modules.
 * Member 4 is responsible for hooking in live notification counts.
 */
function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🏫 Smart Campus Hub
      </Link>

      <ul className="navbar-links">
        {/* Member 1 — uncomment when ResourcesPage is ready */}
        {/* <li><Link to="/resources">Resources</Link></li> */}

        {/* Member 2 — uncomment when BookingPage is ready */}
        {/* <li><Link to="/bookings">Bookings</Link></li> */}

        {/* Member 3 — uncomment when TicketsPage is ready */}
        {/* <li><Link to="/tickets">Tickets</Link></li> */}

        {/* Member 4 — uncomment when NotificationsPage is ready */}
        {/* <li>
          <Link to="/notifications" className="notification-bell">
            <FiBell />
            <span className="notification-badge">3</span>
          </Link>
        </li> */}

        {isAdmin() && (
          <li><Link to="/admin/bookings">Admin Panel</Link></li>
        )}
      </ul>

      <div className="navbar-user">
        {user ? (
          <>
            <span>👋 {user.name || user.email}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
