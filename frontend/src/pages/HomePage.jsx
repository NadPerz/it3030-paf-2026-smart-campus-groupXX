import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/common/Footer";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_qre4suj";
const EMAILJS_TEMPLATE_ID = "template_li6l897";
const EMAILJS_PUBLIC_KEY = "ZHUkV3Ebs7fB2ENeX";

const STATS = [
  { value: "48", label: "Campus Rooms", suffix: "+" },
  { value: "12", label: "Active Labs", suffix: "" },
  { value: "300", label: "Students Served", suffix: "+" },
  { value: "24", label: "Hour Access", suffix: "/7" },
];

const FEATURES = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    tag: "Facilities",
    title: "Resource Catalogue",
    description:
      "Browse lecture halls, computer labs, seminar rooms, and equipment. Filter by type, location, and availability in real time.",
    link: "/resources",
    accent: "#2563EB",
    bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    border: "#BFDBFE",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="16" r="2" />
      </svg>
    ),
    tag: "Bookings",
    title: "Book a Space",
    description:
      "Reserve rooms and equipment with a few clicks. Track approval status, receive notifications, and check in via QR code on the day.",
    link: "/bookings",
    accent: "#059669",
    bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
    border: "#6EE7B7",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    tag: "Support",
    title: "Incident Tickets",
    description:
      "Report broken equipment, maintenance issues, or IT faults. Upload photos, track technician progress, and get resolved faster.",
    link: "/tickets",
    accent: "#D97706",
    bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
    border: "#FDE68A",
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    tag: "Alerts",
    title: "Notifications",
    description:
      "Get real-time alerts for booking approvals, ticket updates, and campus announcements — all in one organised feed.",
    link: "/notifications",
    accent: "#7C3AED",
    bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
    border: "#DDD6FE",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse Resources",
    desc: "Search available rooms and equipment across campus.",
  },
  {
    step: "02",
    title: "Make a Booking",
    desc: "Select your time slot and submit a booking request.",
  },
  {
    step: "03",
    title: "Get Approved",
    desc: "Admins review and approve — you get notified instantly.",
  },
  {
    step: "04",
    title: "Check In",
    desc: "Scan your QR code at the venue to confirm your session.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ayesha Fernando",
    role: "Final Year, Computer Science",
    avatar: "AF",
    color: "#2563EB",
    bg: "#EFF6FF",
    text: "Booking the computer lab used to take days of back-and-forth emails. Now I reserve a slot in under a minute and get instant confirmation. Absolute game changer.",
  },
  {
    name: "Dr. Rajan Perera",
    role: "Senior Lecturer, Engineering",
    avatar: "RP",
    color: "#059669",
    bg: "#ECFDF5",
    text: "As a lecturer managing multiple lab sessions a week, the Smart Campus Hub has eliminated scheduling conflicts entirely. The QR check-in is a lovely touch.",
  },
  {
    name: "Mihiri Wijesinghe",
    role: "2nd Year, Business Management",
    avatar: "MW",
    color: "#7C3AED",
    bg: "#F5F3FF",
    text: "I reported a broken projector in Seminar Room 3 and it was fixed within the same day. The ticket tracker kept me updated every step. Couldn't ask for more.",
  },
  {
    name: "Kasun Bandara",
    role: "IT Administrator",
    avatar: "KB",
    color: "#D97706",
    bg: "#FFFBEB",
    text: "Managing 48 rooms used to be a logistical nightmare. The admin dashboard gives us a real-time overview of everything — from bookings to maintenance tickets.",
  },
  {
    name: "Nithya Krishnan",
    role: "3rd Year, Biomedical Science",
    avatar: "NK",
    color: "#0891B2",
    bg: "#ECFEFF",
    text: "The notification system is spot on. I never miss an approval or a schedule change. The interface is so clean and intuitive — I picked it up in minutes.",
  },
  {
    name: "Prof. Suresh Dias",
    role: "Head of Department, Sciences",
    avatar: "SD",
    color: "#BE185D",
    bg: "#FDF2F8",
    text: "Smart Campus Hub has modernised how our faculty operates. Transparency, speed, and accountability — all things missing from the old paper-based system.",
  },
  {
    name: "Amali Jayasuriya",
    role: "1st Year, Architecture",
    avatar: "AJ",
    color: "#059669",
    bg: "#ECFDF5",
    text: "Found an available studio space for a last-minute group project within seconds. The real-time availability filter is incredibly useful during exam season.",
  },
  {
    name: "Tharaka Wickramasinghe",
    role: "Campus Facilities Manager",
    avatar: "TW",
    color: "#2563EB",
    bg: "#EFF6FF",
    text: "We've reduced resource conflicts by over 80% since switching to Smart Campus Hub. The data insights help us plan maintenance without disrupting bookings.",
  },
];

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const end = parseInt(target);
          const duration = 1200;
          const step = Math.ceil(end / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, end);
            setCount(current);
            if (current >= end) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function TestimonialsMarquee() {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);
  const SPEED = 0.45;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      if (!pausedRef.current) {
        posRef.current -= SPEED;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(posRef.current) >= halfWidth) {
          posRef.current = 0;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      style={{
        padding: "clamp(60px, 8vw, 100px) 0",
        overflow: "hidden",
        background: "#F8FAFC",
        borderTop: "1px solid #F1F5F9",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "48px",
          padding: "0 clamp(20px, 5vw, 80px)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#2563EB",
            marginBottom: "12px",
          }}
        >
          Testimonials
        </div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
            color: "#0F172A",
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}
        >
          Loved by the campus community
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#64748B",
            maxWidth: "460px",
            margin: "0 auto",
            lineHeight: "1.7",
          }}
        >
          Students, lecturers, and staff share how Smart Campus Hub changed
          their day-to-day.
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "120px",
            zIndex: 2,
            background: "linear-gradient(90deg, #F8FAFC 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "120px",
            zIndex: 2,
            background: "linear-gradient(270deg, #F8FAFC 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{ overflow: "hidden", cursor: "default" }}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              gap: "20px",
              width: "max-content",
              padding: "12px 10px 24px",
              willChange: "transform",
            }}
          >
            {doubled.map((t, i) => (
              <div
                key={i}
                style={{
                  width: "300px",
                  flexShrink: 0,
                  background: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 12px rgba(0,0,0,0.04)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{ display: "flex", gap: "2px", marginBottom: "14px" }}
                >
                  {[...Array(5)].map((_, si) => (
                    <svg
                      key={si}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="#F59E0B"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "#374151",
                    lineHeight: "1.7",
                    margin: "0 0 20px",
                  }}
                >
                  "{t.text}"
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: t.bg,
                      border: `1.5px solid ${t.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: t.color,
                      flexShrink: 0,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "#94A3B8",
                        marginTop: "1px",
                      }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── HomePage ── */
function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const heroRef = useRef(null);

  const firstName = user?.name?.split(" ")[0] || null;

  // Add inside HomePage function, near the other state/refs:
  const contactFormRef = useRef(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactStatus, setContactStatus] = useState(null);

 async function handleContactSubmit(e) {
  e.preventDefault();
  setContactStatus("sending");
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        time: new Date().toLocaleString(),
      },
      EMAILJS_PUBLIC_KEY,
    );
    setContactStatus("success");
    setContactForm({ name: "", email: "", message: "" });
  } catch (err) {
    console.error("EmailJS error:", err);
    setContactStatus("error");
  }
}

  useEffect(() => {
    if (location.state?.scrollTo === "about") {
      const timer = setTimeout(() => {
        document
          .getElementById("about")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
      return () => clearTimeout(timer);
    }
    if (location.state?.scrollTo === "contact") {
      const timer = setTimeout(() => {
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Outfit', sans-serif",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

        .sc-hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.6rem, 5vw, 4rem);
          line-height: 1.1;
          color: #0F172A;
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .sc-hero-title em {
          font-style: italic;
          color: #2563EB;
        }
        .sc-feature-card {
          background: white;
          border-radius: 16px;
          padding: 28px;
          border: 1px solid #E2E8F0;
          text-decoration: none;
          display: block;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .sc-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        .sc-step-card {
          background: white;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #E2E8F0;
          transition: box-shadow 0.2s;
        }
        .sc-step-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .sc-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
        }
        .sc-cta-primary {
          background: #0F172A;
          color: white;
        }
        .sc-cta-primary:hover {
          background: #1E293B;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(15,23,42,0.25);
        }
        .sc-cta-secondary {
          background: white;
          color: #0F172A;
          border: 1.5px solid #CBD5E1 !important;
        }
        .sc-cta-secondary:hover {
          border-color: #94A3B8 !important;
          background: #F8FAFC;
        }
        .sc-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 999px;
          margin-bottom: 12px;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sc-fade-up { animation: fadeUp 0.6s ease both; }
        .sc-fade-up-1 { animation-delay: 0.1s; }
        .sc-fade-up-2 { animation-delay: 0.2s; }
        .sc-fade-up-3 { animation-delay: 0.3s; }
        .sc-fade-up-4 { animation-delay: 0.4s; }
      `}</style>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        style={{
          padding:
            "clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px) clamp(50px, 6vw, 80px)",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            className="sc-fade-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "999px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#1D4ED8",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#2563EB",
                display: "inline-block",
              }}
            />
            {firstName
              ? `Welcome back, ${firstName}`
              : "Smart Campus Operations Hub"}
          </div>

          <h1 className="sc-hero-title sc-fade-up sc-fade-up-1">
            Manage your
            <br />
            campus <em>smarter,</em>
            <br />
            not harder.
          </h1>

          <p
            className="sc-fade-up sc-fade-up-2"
            style={{
              fontSize: "17px",
              color: "#475569",
              lineHeight: "1.7",
              margin: "0 0 32px",
              maxWidth: "440px",
            }}
          >
            Book rooms, report issues, and stay on top of every campus activity
            — all from one place.
          </p>

          <div
            className="sc-fade-up sc-fade-up-3"
            style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
          >
            <Link to="/bookings" className="sc-cta-btn sc-cta-primary">
              Book a space
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/resources" className="sc-cta-btn sc-cta-secondary">
              Browse resources
            </Link>
          </div>
        </div>

        <div
          className="sc-fade-up sc-fade-up-2"
          style={{ position: "relative", height: "340px" }}
        >
          <div
            style={{
              position: "absolute",
              top: "30px",
              right: "10px",
              width: "260px",
              height: "160px",
              background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
              borderRadius: "18px",
              opacity: 0.15,
              transform: "rotate(6deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "15px",
              right: "20px",
              width: "270px",
              height: "165px",
              background: "linear-gradient(135deg, #0F172A, #1E293B)",
              borderRadius: "18px",
              opacity: 0.08,
              transform: "rotate(3deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "30px",
              width: "280px",
              background: "white",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
              border: "1px solid #F1F5F9",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#64748B",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              Upcoming Booking
            </div>
            <div
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#0F172A",
                  }}
                >
                  Lab B — Computer Lab
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748B",
                    marginTop: "3px",
                  }}
                >
                  Today, 2:00 PM – 4:00 PM
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#ECFDF5",
                    color: "#059669",
                    borderRadius: "999px",
                    padding: "3px 10px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#059669",
                      display: "inline-block",
                    }}
                  />
                  Approved
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "80px",
              right: "0px",
              background: "white",
              borderRadius: "14px",
              padding: "14px 18px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
              border: "1px solid #F1F5F9",
              display: "flex",
              gap: "10px",
              alignItems: "center",
              width: "240px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: "#F5F3FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#0F172A",
                }}
              >
                Booking Approved
              </div>
              <div
                style={{ fontSize: "11px", color: "#94A3B8", marginTop: "1px" }}
              >
                Hall A confirmed for Friday
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "60px",
              background: "#0F172A",
              borderRadius: "12px",
              padding: "12px 18px",
              display: "flex",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "white",
                  lineHeight: 1,
                }}
              >
                48+
              </div>
              <div
                style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}
              >
                Rooms available
              </div>
            </div>
            <div
              style={{ width: "1px", height: "30px", background: "#334155" }}
            />
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "white",
                  lineHeight: 1,
                }}
              >
                12
              </div>
              <div
                style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}
              >
                Labs active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
     {/* ── STATS BAR ── */}
<section
  style={{
    padding: "clamp(20px, 4vw, 40px) clamp(20px, 5vw, 80px)",
  }}
>
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      background: "#0F172A",
      borderRadius: "20px",
      padding: "36px 20px",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "0",
      boxShadow: "0 20px 50px rgba(15,23,42,0.15)",
    }}
  >
    {STATS.map((s, i) => (
      <div
        key={s.label}
        style={{
          textAlign: "center",
          padding: "8px 20px",
          borderRight:
            i < STATS.length - 1 ? "1px solid #1E293B" : "none",
        }}
      >
        <div
          style={{
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: "700",
            color: "white",
            fontFamily: "'DM Serif Display', serif",
            lineHeight: 1,
          }}
        >
          <AnimatedCounter target={s.value} suffix={s.suffix} />
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#64748B",
            marginTop: "6px",
            fontWeight: "500",
          }}
        >
          {s.label}
        </div>
      </div>
    ))}
  </div>
</section>

      {/* ── FEATURES ── */}
      <section
        id="about"
        style={{
          padding: "clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#2563EB",
              marginBottom: "12px",
            }}
          >
            Everything you need
          </div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              color: "#0F172A",
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}
          >
            One platform, all campus operations
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#64748B",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            From booking a lecture hall to reporting a broken projector — it's
            all here.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              to={f.link}
              className="sc-feature-card"
              style={{ textDecoration: "none" }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = f.border;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: f.accent,
                  borderRadius: "16px 16px 0 0",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
              />
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "12px",
                    background: f.bg,
                    border: `1px solid ${f.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: f.accent,
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    className="sc-tag"
                    style={{
                      background: f.bg,
                      color: f.accent,
                      border: `1px solid ${f.border}`,
                    }}
                  >
                    {f.tag}
                  </span>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#0F172A",
                      margin: "0 0 8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#64748B",
                      lineHeight: "1.65",
                      margin: 0,
                    }}
                  >
                    {f.description}
                  </p>
                  <div
                    style={{
                      marginTop: "16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: f.accent,
                    }}
                  >
                    Open
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          background: "white",
          padding: "clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)",
          borderTop: "1px solid #F1F5F9",
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#2563EB",
                marginBottom: "12px",
              }}
            >
              Simple process
            </div>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                color: "#0F172A",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Book a room in four steps
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "32px",
                left: "12.5%",
                right: "12.5%",
                height: "1px",
                background: "linear-gradient(90deg, #BFDBFE, #DDD6FE)",
                zIndex: 0,
              }}
            />
            {HOW_IT_WORKS.map((s, i) => (
              <div
                key={s.step}
                className="sc-step-card"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: i === 0 ? "#0F172A" : "#F8FAFC",
                    border: i === 0 ? "none" : "1.5px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: i === 0 ? "white" : "#64748B",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {s.step}
                  </span>
                </div>
                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#0F172A",
                    margin: "0 0 8px",
                  }}
                >
                  {s.title}
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748B",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPUS INFO STRIP ── */}
      <section
        style={{ padding: "clamp(50px, 6vw, 80px) clamp(20px, 5vw, 80px)" }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#2563EB",
                marginBottom: "12px",
              }}
            >
              Our campus
            </div>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                color: "#0F172A",
                margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}
            >
              A modern campus
              <br />
              built for{" "}
              <em style={{ fontStyle: "italic", color: "#2563EB" }}>you</em>
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#475569",
                lineHeight: "1.75",
                margin: "0 0 24px",
              }}
            >
              Smart Campus Hub connects students, staff, and administrators to
              manage over 48 campus spaces across lecture halls, laboratories,
              seminar rooms, and shared facilities — all managed digitally.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              {[
                { label: "Lecture Halls", value: "14 rooms" },
                { label: "Computer Labs", value: "12 labs" },
                { label: "Seminar Rooms", value: "18 rooms" },
                { label: "Equipment Pool", value: "40+ items" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94A3B8",
                      marginTop: "2px",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#0F172A",
                margin: "0 0 6px",
              }}
            >
              Quick actions
            </h3>
            <p
              style={{ fontSize: "13px", color: "#94A3B8", margin: "0 0 22px" }}
            >
              Jump straight to what you need
            </p>
            {[
              {
                label: "Book a lecture hall",
                sub: "Check availability & reserve",
                icon: "🏛️",
                link: "/bookings",
                color: "#2563EB",
                bg: "#EFF6FF",
              },
              {
                label: "My bookings",
                sub: "View upcoming reservations",
                icon: "📋",
                link: "/bookings",
                color: "#059669",
                bg: "#ECFDF5",
              },
              {
                label: "Report an issue",
                sub: "Submit a maintenance ticket",
                icon: "🔧",
                link: "/tickets",
                color: "#D97706",
                bg: "#FFFBEB",
              },
              {
                label: "Notifications",
                sub: "See your latest alerts",
                icon: "🔔",
                link: "/notifications",
                color: "#7C3AED",
                bg: "#F5F3FF",
              },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.link}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  marginBottom: "8px",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  background: "transparent",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = item.bg)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "9px",
                    background: item.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "17px",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0F172A",
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                    {item.sub}
                  </div>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialsMarquee />

      {/* ── CTA BANNER ── */}
      <section
        style={{ padding: "0 clamp(20px, 5vw, 80px) clamp(60px, 8vw, 100px)" }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            background:
              "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)",
            borderRadius: "24px",
            padding: "clamp(40px, 6vw, 64px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "10%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(37,99,235,0.12)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              right: "25%",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(124,58,237,0.1)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                color: "white",
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              Ready to get started?
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#94A3B8",
                margin: 0,
                maxWidth: "420px",
                lineHeight: "1.6",
              }}
            >
              Browse available rooms, make a booking, or check your
              notifications — all in one place.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <Link
              to="/bookings"
              className="sc-cta-btn"
              style={{ background: "#2563EB", color: "white" }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#1D4ED8")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#2563EB")}
            >
              Make a booking
            </Link>
            <Link
              to="/resources"
              className="sc-cta-btn"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.14)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
            >
              Browse resources
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT US ── */}
      <section
        id="contact"
        style={{ padding: "0 clamp(20px, 5vw, 80px) clamp(60px, 8vw, 100px)" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#2563EB",
                marginBottom: "12px",
              }}
            >
              Get in touch
            </div>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                color: "#0F172A",
                margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}
            >
              Let's build{" "}
              <em style={{ fontStyle: "italic", color: "#2563EB" }}>
                something great.
              </em>
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#64748B",
                maxWidth: "460px",
                margin: "0 auto",
                lineHeight: "1.7",
              }}
            >
              Have a question or need support? Fill in the form and our team
              will get back to you as soon as possible.
            </p>
          </div>

          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* ── Left: Form ── */}
            <div
              style={{
                background: "white",
                border: "1px solid #E2E8F0",
                borderRadius: "20px",
                padding: "36px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              <style>{`
          .sc-contact-input {
            width: 100%;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 13px 16px;
            font-size: 15px;
            color: #0F172A;
            font-family: 'DM Sans', sans-serif;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
          }
          .sc-contact-input::placeholder { color: #94A3B8; }
          .sc-contact-input:focus {
            border-color: #2563EB;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
            background: white;
          }
          .sc-contact-textarea { resize: vertical; min-height: 150px; }
          .sc-contact-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 7px;
          }
          .sc-contact-send-btn {
            width: 100%;
            padding: 14px;
            border-radius: 10px;
            background: #0F172A;
            color: white;
            font-size: 15px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background 0.2s, transform 0.2s;
          }
          .sc-contact-send-btn:hover:not(:disabled) {
            background: #1E293B;
            transform: translateY(-1px);
          }
          .sc-contact-send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
          @keyframes sc-contact-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
              <form ref={contactFormRef} onSubmit={handleContactSubmit}>
                <div style={{ marginBottom: "18px" }}>
                  <label className="sc-contact-label">Name</label>
                  <input
                    className="sc-contact-input"
                    type="text"
                    name="name"
                    placeholder="Your name..."
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div style={{ marginBottom: "18px" }}>
                  <label className="sc-contact-label">Email</label>
                  <input
                    className="sc-contact-input"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div style={{ marginBottom: "24px" }}>
                  <label className="sc-contact-label">Message</label>
                  <textarea
                    className="sc-contact-input sc-contact-textarea"
                    name="message"
                    placeholder="Your message..."
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="sc-contact-send-btn"
                  disabled={contactStatus === "sending"}
                >
                  {contactStatus === "sending" ? (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          animation: "sc-contact-spin 1s linear infinite",
                        }}
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>

                {contactStatus === "success" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "#ECFDF5",
                      border: "1px solid #6EE7B7",
                      borderRadius: "10px",
                      padding: "13px 16px",
                      color: "#059669",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginTop: "12px",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Message sent! We'll get back to you soon.
                  </div>
                )}
                {contactStatus === "error" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      borderRadius: "10px",
                      padding: "13px 16px",
                      color: "#DC2626",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginTop: "12px",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Something went wrong. Please try again.
                  </div>
                )}
              </form>
            </div>

            {/* ── Right: Info ── */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Contact info card */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  padding: "32px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#0F172A",
                    margin: "0 0 24px",
                  }}
                >
                  Contact Information
                </h3>
                {[
                  {
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                    label: "Email",
                    value: "smartcampushub@gmail.com",
                    bg: "#EFF6FF",
                  },
                  {
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    ),
                    label: "Phone",
                    value: "+94 71 226 7727",
                    bg: "#ECFDF5",
                  },
                  {
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ),
                    label: "Location",
                    value: "Colombo, Sri Lanka",
                    bg: "#F5F3FF",
                  },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      paddingBottom: i < 2 ? "20px" : "0",
                      borderBottom: i < 2 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "11px",
                        background: item.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94A3B8",
                          marginBottom: "2px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#0F172A",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Available card */}
              <div
                style={{
                  background: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  padding: "24px 28px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "#22C55E",
                      boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    Currently Available
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: "#64748B",
                    lineHeight: "1.65",
                    margin: 0,
                  }}
                >
                  Our support team is active and ready to assist you with
                  bookings, technical issues, and campus facility queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
