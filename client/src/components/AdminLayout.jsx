
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "../styles/admin-layout.css";

const adminLinks = [
  { name: "Dashboard", path: "/dashboard", icon: "🏠" },
  { name: "Student Management", path: "/students", icon: "👨‍🎓" },
  { name: "Add Student", path: "/add-student", icon: "➕" },
  { name: "Room Management", path: "/rooms", icon: "🏠" },
  { name: "Fee Management", path: "/fees", icon: "💰" },
  { name: "Complaints", path: "/complaints", icon: "📝" },
  { name: "Mess Management", path: "/mess", icon: "🍽️" },
  { name: "Attendance", path: "/attendance", icon: "📋" },
  { name: "Outings", path: "/outings", icon: "🚶" },
  { name: "Holidays", path: "/holidays", icon: "🎉" },
  { name: "Reports", path: "/reports", icon: "📊" }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-layout">

      {sidebarOpen && (
        <button
          className="admin-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <span className="admin-brand-icon">🏨</span>
            <span>HOSTEL ADMIN</span>
          </div>

          <button
            type="button"
            className="admin-close-menu"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <p className="admin-nav-label">MAIN MENU</p>

        <nav className="admin-navigation">
          {adminLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/dashboard"}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "admin-nav-active" : ""}`
              }
            >
              <span className="admin-nav-icon">{link.icon}</span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <span>Hostel Management System</span>
          <small>Admin Panel</small>
        </div>
      </aside>

      <div className="admin-main-area">
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>

          <strong>HOSTEL ADMIN</strong>
        </header>

        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
