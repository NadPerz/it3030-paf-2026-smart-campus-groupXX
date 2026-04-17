import React from "react";
import { Link } from "react-router-dom";

/**
 * Global footer — matches the Smart Campus Hub homepage design system.
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');

        .sc-footer {
          background: #0F172A;
          color: white;
          font-family: 'DM Sans', sans-serif;

          /* ✅ FULL WIDTH FIX */
          width: 100vw;
          margin-left: calc(-50vw + 50%);

          padding: clamp(48px, 6vw, 72px) clamp(20px, 5vw, 80px) 0;
        }

        .sc-footer__inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .sc-footer__grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }

        .sc-footer__logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          text-decoration: none;
        }

        .sc-footer__logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #1E293B 0%, #2563EB 100%);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sc-footer__logo-name {
          font-size: 14px;
          font-weight: 700;
          color: white;
          line-height: 1;
          letter-spacing: -0.01em;
        }

        .sc-footer__logo-sub {
          font-size: 10px;
          color: #475569;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .sc-footer__desc {
          font-size: 13.5px;
          color: #64748B;
          line-height: 1.75;
          margin: 0 0 20px;
          max-width: 280px;
        }

        .sc-footer__status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(5, 150, 105, 0.12);
          border: 1px solid rgba(5, 150, 105, 0.25);
          border-radius: 999px;
          padding: 5px 12px;
        }

        .sc-footer__status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          display: inline-block;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          flex-shrink: 0;
        }

        .sc-footer__status-text {
          font-size: 11.5px;
          font-weight: 600;
          color: #10B981;
        }

        .sc-footer__col-heading {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 16px;
          display: block;
        }

        .sc-footer__col-link {
          display: block;
          font-size: 13.5px;
          color: #64748B;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .sc-footer__col-link:hover { color: white; }

        .sc-footer__col-text {
          display: block;
          font-size: 13.5px;
          color: #64748B;
          margin-bottom: 10px;
        }

        .sc-footer__stats {
          border-top: 1px solid #1E293B;
          border-bottom: 1px solid #1E293B;
          padding: 24px 0;
          margin-bottom: 28px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .sc-footer__stat {
          text-align: center;
        }

        .sc-footer__stat-value {
          font-size: 20px;
          font-weight: 700;
          color: white;
          font-family: 'DM Serif Display', serif;
          display: block;
        }

        .sc-footer__stat-label {
          font-size: 11.5px;
          color: #475569;
          margin-top: 3px;
          font-weight: 500;
          display: block;
        }

        .sc-footer__divider-v {
          border-right: 1px solid #1E293B;
        }

        .sc-footer__bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .sc-footer__copy {
          font-size: 12.5px;
          color: #334155;
        }

        .sc-footer__legal {
          display: flex;
          gap: 20px;
        }

        .sc-footer__legal-item {
          font-size: 12.5px;
          color: #334155;
          cursor: pointer;
          transition: color 0.15s;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
        }

        .sc-footer__legal-item:hover { color: #64748B; }

        @media (max-width: 900px) {
          .sc-footer__grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .sc-footer__stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .sc-footer__grid {
            grid-template-columns: 1fr;
          }
          .sc-footer__bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <footer className="sc-footer">
        <div className="sc-footer__inner">

          {/* ── Top grid ── */}
          <div className="sc-footer__grid">

            {/* Brand column */}
            <div>
              <Link to="/" className="sc-footer__logo">
                <div className="sc-footer__logo-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                </div>
                <div>
                  <div className="sc-footer__logo-name">Smart Campus Hub</div>
                  <div className="sc-footer__logo-sub">Operations Platform</div>
                </div>
              </Link>

              <p className="sc-footer__desc">
                A unified platform for students, lecturers, and administrators to manage campus rooms, equipment, and support — all in one place.
              </p>

              <div className="sc-footer__status">
                <span className="sc-footer__status-dot" />
                <span className="sc-footer__status-text">All systems operational</span>
              </div>
            </div>

            {/* Platform column */}
            <div>
              <span className="sc-footer__col-heading">Platform</span>
              <Link to="/resources" className="sc-footer__col-link">Resource Catalogue</Link>
              <Link to="/bookings" className="sc-footer__col-link">Book a Space</Link>
              <Link to="/bookings" className="sc-footer__col-link">My Bookings</Link>
              <Link to="/notifications" className="sc-footer__col-link">Notifications</Link>
              <Link to="/tickets" className="sc-footer__col-link">Report an Issue</Link>
            </div>

            {/* Campus column */}
            <div>
              <span className="sc-footer__col-heading">Campus</span>
              <span className="sc-footer__col-text">Lecture Halls</span>
              <span className="sc-footer__col-text">Computer Labs</span>
              <span className="sc-footer__col-text">Seminar Rooms</span>
              <span className="sc-footer__col-text">Equipment Pool</span>
              <span className="sc-footer__col-text">Facilities Map</span>
            </div>

            {/* Support column */}
            <div>
              <span className="sc-footer__col-heading">Support</span>
              <Link to="/help" className="sc-footer__col-link">Help Centre</Link>
              <Link to="/tickets" className="sc-footer__col-link">Submit a Ticket</Link>
              <Link to="/contact" className="sc-footer__col-link">Contact Admin</Link>
              <Link to="/accessibility" className="sc-footer__col-link">Accessibility</Link>
              <Link to="/privacy" className="sc-footer__col-link">Privacy Policy</Link>
            </div>

          </div>

          {/* ── Stats ── */}
          <div className="sc-footer__stats">
            {[
              { value: "48+", label: "Campus Rooms" },
              { value: "12",  label: "Active Labs" },
              { value: "300+",label: "Students Served" },
              { value: "24/7",label: "Platform Access" },
            ].map((s, i) => (
              <div key={s.label} className={`sc-footer__stat ${i < 3 ? "sc-footer__divider-v" : ""}`}>
                <span className="sc-footer__stat-value">{s.value}</span>
                <span className="sc-footer__stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Bottom ── */}
          <div className="sc-footer__bottom">
            <span className="sc-footer__copy">
              © {year} Smart Campus Hub. All rights reserved.
            </span>
            <div className="sc-footer__legal">
              <span className="sc-footer__legal-item">Terms of Use</span>
              <span className="sc-footer__legal-item">Privacy Policy</span>
              <span className="sc-footer__legal-item">Cookie Policy</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}

export default Footer;