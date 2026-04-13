import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notification/NotificationBell";

/**
 * Global top navbar — shown on all non-admin pages.
 * Hidden on /admin/* routes because AdminLayout has its own fixed navbar.
 */
function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Let AdminLayout handle its own navbar on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  function handleLogout() {
    logout();
    navigate("/login");
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

        {isAdmin() && (
          <li>
            <Link
              to="/admin/users"
              style={{ fontSize: "1rem", fontWeight: "600", color: "white" }}
            >
              Admin Panel
            </Link>
          </li>
        )}
      </ul>

      <div className="navbar-user">
        {user ? (
          <>
            {/* Bell only shown to regular users — admins use the sidebar panel */}
            {!isAdmin() && <NotificationBell />}

            <a
              href="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {user.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt="profile"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    cursor: "pointer",
                  }}
                />
              )}
              <span>👋 {user.name || user.email}</span>
            </a>
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