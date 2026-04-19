import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notification/NotificationBell";

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  if (location.pathname.startsWith("/admin")) return null;
  if (location.pathname.startsWith("/technician")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleAboutClick(e) {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "about" } });
    }
  }

  function handleContactClick(e) {
    e.preventDefault();
    if (location.pathname === "/") {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "contact" } });
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  const NAV_LINKS = [
    { label: "Resources", to: "/resources" },
    { label: "Tickets", to: "/incident-tickets" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

        .sc-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .sc-navbar--scrolled {
          background: rgba(255, 255, 255, 0.92) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #E2E8F0 !important;
          box-shadow: 0 2px 20px rgba(0,0,0,0.06) !important;
        }
        .sc-navbar--top {
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid transparent;
          box-shadow: none;
        }
        .sc-navbar__inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 80px);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .sc-navbar__logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .sc-navbar__logo-icon {
          width: 44px;
          height: 44px;
          border-radius: 9px;
          background: linear-gradient(135deg, #0F172A 0%, #2563EB 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sc-navbar__logo-text {
          display: flex;
          flex-direction: column;
        }
        .sc-navbar__logo-name {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1;
          letter-spacing: -0.01em;
        }
        .sc-navbar__logo-sub {
          font-size: 12px;
          color: #94A3B8;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-top: 1px;
        }
        .sc-navbar__links {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .sc-navbar__link {
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 15.5px;
          font-weight: 500;
          color: #64748B;
          background: transparent;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .sc-navbar__link:hover {
          background: #F8FAFC;
          color: #0F172A;
        }
        .sc-navbar__link--active {
          background: #F1F5F9 !important;
          color: #0F172A !important;
          font-weight: 600 !important;
        }
        .sc-navbar__link--admin {
          color: #2563EB !important;
          font-weight: 600 !important;
          background: #EFF6FF !important;
          border: 1px solid #BFDBFE;
        }
        .sc-navbar__link--admin:hover {
          background: #DBEAFE !important;
        }
        .sc-navbar__right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .sc-navbar__avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563EB, #7C3AED);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .sc-navbar__avatar:hover { opacity: 0.85; }
        .sc-navbar__avatar-img {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid #E2E8F0;
        }
        .sc-navbar__user-name {
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sc-navbar__logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14.5px;
          font-weight: 500;
          background: transparent;
          color: #64748B;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .sc-navbar__logout-btn:hover {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FCA5A5;
        }
        .sc-navbar__signin-btn {
          text-decoration: none;
          padding: 7px 16px;
          border-radius: 8px;
          font-size: 14.5px;
          font-weight: 500;
          color: #475569;
          border: 1px solid #E2E8F0;
          background: white;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .sc-navbar__signin-btn:hover {
          border-color: #CBD5E1;
          background: #F8FAFC;
        }
        .sc-navbar__divider {
          width: 1px;
          height: 20px;
          background: #E2E8F0;
          flex-shrink: 0;
        }
      `}</style>

      <nav
        className={`sc-navbar ${scrolled ? "sc-navbar--scrolled" : "sc-navbar--top"}`}
      >
        <div className="sc-navbar__inner">
          {/* ── Logo ── */}
          <Link to="/" className="sc-navbar__logo">
            <div className="sc-navbar__logo-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div className="sc-navbar__logo-text">
              <span className="sc-navbar__logo-name">Smart Campus</span>
              <span className="sc-navbar__logo-sub">Hub</span>
            </div>
          </Link>

          {/* ── Nav links ── */}
          <ul className="sc-navbar__links">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className={`sc-navbar__link ${active ? "sc-navbar__link--active" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            <li>
              <a
                href="#"
                className="sc-navbar__link"
                onClick={handleAboutClick}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="#"
                className="sc-navbar__link"
                onClick={handleContactClick}
              >
                Contact Us
              </a>
            </li>

            {isAdmin() && (
              <li>
                <Link
                  to="/admin/users"
                  className="sc-navbar__link sc-navbar__link--admin"
                >
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          {/* ── Right side ── */}
          <div className="sc-navbar__right">
            {user ? (
              <>
                {!isAdmin() && <NotificationBell />}
                <div className="sc-navbar__divider" />

                {user.profilePicture ? (
                  <a href="/profile">
                    <img
                      src={user.profilePicture}
                      alt={user.name || "Profile"}
                      className="sc-navbar__avatar-img"
                      title={user.name || user.email}
                    />
                  </a>
                ) : (
                  <a
                    href="/profile"
                    className="sc-navbar__avatar"
                    title={user.name || user.email}
                  >
                    {initials || "U"}
                  </a>
                )}

                <button
                  className="sc-navbar__logout-btn"
                  onClick={handleLogout}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="sc-navbar__signin-btn">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
