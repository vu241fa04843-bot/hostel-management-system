
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await API.get("/dashboard");
      setStats(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    ["Total Students", stats?.totalStudents ?? 0, "👨‍🎓"],
    ["Total Fee Collection", `₹${stats?.totalFees ?? 0}`, "💰"],
    ["Total Complaints", stats?.totalComplaints ?? 0, "📝"],
    ["Pending Complaints", stats?.pendingComplaints ?? 0, "⏳"],
    ["Present Attendance", stats?.presentAttendance ?? 0, "✅"],
    ["Absent Attendance", stats?.absentAttendance ?? 0, "❌"],
    ["Pending Outings", stats?.pendingOutings ?? 0, "🚶"],
    ["Approved Outings", stats?.approvedOutings ?? 0, "✔️"],
    ["Total Holidays", stats?.totalHolidays ?? 0, "🎉"]
  ];

  const modules = [
    ["Student Management", "/students", "👨‍🎓"],
    ["Add Student", "/add-student", "➕"],
    ["Room Management", "/rooms", "🏠"],
    ["Fee Management", "/fees", "💰"],
    ["Complaints", "/complaints", "📝"],
    ["Mess Management", "/mess", "🍽️"],
    ["Attendance", "/attendance", "📋"],
    ["Outings", "/outings", "🚶"],
    ["Holidays", "/holidays", "🎉"],
    ["Reports", "/reports", "📊"]
  ];

  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to your hostel management control center.
          </p>
        </div>

        <button
          className="dashboard-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {loading && (
        <p className="dashboard-loading">Loading dashboard...</p>
      )}

      {error && (
        <p className="dashboard-error">{error}</p>
      )}

      <section className="dashboard-section">
        <h2>Hostel Overview</h2>

        <div className="dashboard-grid">
          {cards.map(([title, value, icon]) => (
            <div className="dashboard-card" key={title}>
              <div className="dashboard-card-label">
                <span>{icon}</span> {title}
              </div>
              <p className="dashboard-card-value">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Management Modules</h2>

        <div className="dashboard-grid">
          {modules.map(([name, path, icon]) => (
            <Link
              className="dashboard-service"
              to={path}
              key={path}
            >
              <span className="dashboard-service-icon">{icon}</span>
              <strong>{name}</strong>
              <span className="service-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {stats && (
        <section className="dashboard-summary">
          <h2>Hostel Summary</h2>

          <p>
            Total attendance records:
            <strong> {stats.totalAttendance ?? 0}</strong>
          </p>

          <p>
            Total complaints:
            <strong> {stats.totalComplaints ?? 0}</strong>
          </p>

          <p>
            Total holidays:
            <strong> {stats.totalHolidays ?? 0}</strong>
          </p>
        </section>
      )}
    </div>
  );
}
