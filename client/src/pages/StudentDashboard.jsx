
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
    <main className="student-dashboard-content">

      <header className="student-dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>
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

      <section className="student-welcome-card">
        <h2>Welcome to Your Hostel Portal 👋</h2>

        <p>
          View your hostel services, check your information,
          and manage your requests from one place.
        </p>
      </section>

      <section className="student-services-section">
        <h2>Student Services</h2>

        <div className="student-services-grid">
          {services.map(([name, path, icon]) => (
            <Link
              className="student-service-card"
              to={path}
              key={path}
            >
              <span className="student-service-icon">
                {icon}
              </span>

              <strong>{name}</strong>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}

export default StudentDashboard;
