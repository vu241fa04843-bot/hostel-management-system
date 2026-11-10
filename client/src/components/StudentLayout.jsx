
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "../styles/student-layout.css";

const studentLinks = [
  { name: "Dashboard", path: "/student-dashboard", icon: "🏠" },
  { name: "My Profile", path: "/student-profile", icon: "👤" },
  { name: "My Fees", path: "/student-fees", icon: "💰" },
  { name: "Complaints", path: "/student-complaints", icon: "📝" },
  { name: "Outings", path: "/student-outings", icon: "🚶" },
  { name: "Holidays", path: "/student-holidays", icon: "🎉" },
  { name: "Mess Menu", path: "/student-mess-menu", icon: "🍽️" },
  { name: "Meal History", path: "/student-meal-history", icon: "📋" },
  { name: "Attendance", path: "/student-attendance", icon: "✅" }
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="student-layout">

      {sidebarOpen && (
        <button
          className="student-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`student-sidebar ${
          sidebarOpen ? "student-sidebar-open" : ""
        }`}
      >
        <div className="student-sidebar-header">
          <div className="student-brand">
            <span>🏨</span>
            <strong>HOSTEL STUDENT</strong>
          </div>

          <button
            className="student-close-menu"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <p className="student-nav-label">STUDENT MENU</p>

        <nav className="student-navigation">
          {studentLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/student-dashboard"}
              className={({ isActive }) =>
                `student-nav-link ${
                  isActive ? "student-nav-active" : ""
                }`
              }
            >
              <span className="student-nav-icon">{link.icon}</span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="student-sidebar-footer">
          <strong>Hostel Management System</strong>
          <small>Student Portal</small>
        </div>
      </aside>

      <div className="student-main-area">

        <header className="student-mobile-header">
          <button
            type="button"
            className="student-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>

          <strong>HOSTEL STUDENT</strong>
        </header>

        <main className="student-page-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
