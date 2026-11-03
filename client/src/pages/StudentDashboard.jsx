
import { Link, useNavigate } from "react-router-dom";

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const services = [
    ["My Profile", "/student-profile", "👤"],
    ["My Fees", "/student-fees", "💰"],
    ["My Complaints", "/student-complaints", "📝"],
    ["My Outings", "/student-outings", "🚶"],
    ["Hostel Holidays", "/student-holidays", "🎉"],
    ["Mess Menu", "/student-mess-menu", "🍽️"],
    ["My Meal History", "/student-meal-history", "📋"],
    ["My Attendance", "/student-attendance", "✅"],
  ];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-brand">HOSTEL STUDENT</h2>

        <nav className="dashboard-nav">
          <Link to="/student-dashboard">🏠 Dashboard</Link>
          {services.map(([name, path, icon]) => (
            <Link to={path} key={path}>
              {icon} {name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome, {user?.name || "Student"}!
            </p>
          </div>

          <button
            className="dashboard-button danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <section className="dashboard-card">
          <h2>Welcome to Your Hostel Portal 👋</h2>
          <p className="dashboard-subtitle">
            View your hostel services, check your information, and manage
            your requests from one place.
          </p>
        </section>

        <section className="dashboard-section">
          <h2>Student Services</h2>

          <div className="dashboard-grid">
            {services.map(([name, path, icon]) => (
              <Link className="dashboard-service" to={path} key={path}>
                <span className="dashboard-service-icon">{icon}</span>
                <strong>{name}</strong>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
