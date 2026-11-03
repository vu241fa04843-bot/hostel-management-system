
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await API.get("/holidays");
      setHolidays(response.data);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to load holidays."
      );
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date) => {
    if (!date) return false;

    return new Date(date) >= new Date(new Date().toDateString());
  };

  if (loading) {
    return (
      <div className="dashboard-main">
        <p style={{ color: "#cbd5e1" }}>Loading holidays...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div style={{ marginBottom: "25px" }}>
        <Link
          to="/student-dashboard"
          style={{
            color: "#38bdf8",
            textDecoration: "none",
            fontSize: "14px"
          }}
        >
          ← Back to Student Dashboard
        </Link>

        <h1 className="dashboard-title" style={{ marginTop: "18px" }}>
          Hostel Holidays
        </h1>

        <p className="dashboard-subtitle">
          View upcoming and previous hostel holidays.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            color: "#fb7185",
            background: "rgba(251, 113, 133, 0.12)"
          }}
        >
          {message}
        </div>
      )}

      {holidays.length === 0 ? (
        <div className="dashboard-card">
          <p style={{ color: "#94a3b8" }}>
            No holidays available.
          </p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {holidays.map((holiday) => {
            const upcoming = isUpcoming(holiday.startDate);

            return (
              <div
                key={holiday._id}
                className="dashboard-card"
                style={{
                  borderLeft: "4px solid #38bdf8"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  <h2 style={{ color: "#e5e7eb", margin: 0 }}>
                    {holiday.holidayName || holiday.name}
                  </h2>

                  <span
                    style={{
                      color: upcoming ? "#34d399" : "#94a3b8",
                      background: upcoming
                        ? "rgba(52, 211, 153, 0.12)"
                        : "rgba(148, 163, 184, 0.12)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  >
                    {upcoming ? "Upcoming" : "Completed"}
                  </span>
                </div>

                <p style={{ color: "#cbd5e1", marginTop: "18px" }}>
                  <strong>Description:</strong>{" "}
                  {holiday.description || "No description"}
                </p>

                <p style={{ color: "#cbd5e1" }}>
                  <strong>Start Date:</strong>{" "}
                  {holiday.startDate
                    ? new Date(holiday.startDate).toLocaleDateString()
                    : "Not specified"}
                </p>

                <p style={{ color: "#cbd5e1" }}>
                  <strong>End Date:</strong>{" "}
                  {holiday.endDate
                    ? new Date(holiday.endDate).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentHolidays;
