
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await API.get(
          "/student-attendance/my-attendance"
        );

        setRecords(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load attendance records."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const presentCount = records.filter(
    (record) => record.status === "Present"
  ).length;

  const absentCount = records.filter(
    (record) => record.status === "Absent"
  ).length;

  const leaveCount = records.filter(
    (record) => record.status === "Leave"
  ).length;

  const percentage =
    records.length > 0
      ? ((presentCount / records.length) * 100).toFixed(1)
      : "0.0";

  const summaryCards = [
    {
      label: "Present",
      value: presentCount,
      color: "present"
    },
    {
      label: "Absent",
      value: absentCount,
      color: "absent"
    },
    {
      label: "Leave",
      value: leaveCount,
      color: "leave"
    },
    {
      label: "Attendance",
      value: `${percentage}%`,
      color: "percentage"
    }
  ];

  const getStatusClass = (status) => {
    if (status === "Present") return "attendance-status-present";
    if (status === "Absent") return "attendance-status-absent";
    if (status === "Leave") return "attendance-status-leave";

    return "attendance-status-default";
  };

  return (
    <div className="student-attendance-page">
      <Link
        to="/student-dashboard"
        className="attendance-back-link"
      >
        ← Back to Student Dashboard
      </Link>

      <div className="attendance-page-header">
        <div>
          <span className="attendance-eyebrow">
            STUDENT SERVICES
          </span>

          <h1>My Attendance</h1>

          <p>
            View your hostel attendance records and attendance
            percentage.
          </p>
        </div>
      </div>

      {loading && (
        <div className="attendance-message-card">
          <p>Loading attendance records...</p>
        </div>
      )}

      {error && (
        <div className="attendance-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="attendance-summary-grid">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className={`attendance-summary-card ${card.color}`}
              >
                <span>{card.label}</span>
                <h2>{card.value}</h2>
              </div>
            ))}
          </div>

          <section className="attendance-records-card">
            <div className="attendance-section-heading">
              <div>
                <h2>Attendance Records</h2>
                <p>Your recorded attendance history</p>
              </div>

              <span className="attendance-record-count">
                {records.length} Records
              </span>
            </div>

            {records.length === 0 ? (
              <div className="attendance-empty-state">
                <span className="attendance-empty-icon">📋</span>
                <h3>No Attendance Records</h3>
                <p>
                  Your attendance records will appear here when
                  they are available.
                </p>
              </div>
            ) : (
              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id}>
                        <td>
                          {record.date
                            ? new Date(record.date).toLocaleDateString()
                            : "Not specified"}
                        </td>

                        <td>
                          <span
                            className={`attendance-status ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status || "Not specified"}
                          </span>
                        </td>

                        <td>{record.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default StudentAttendance;
