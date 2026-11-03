
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

  const getStatusStyle = (status) => {
    if (status === "Present") {
      return {
        color: "#34d399",
        background: "rgba(52, 211, 153, 0.12)"
      };
    }

    if (status === "Absent") {
      return {
        color: "#fb7185",
        background: "rgba(251, 113, 133, 0.12)"
      };
    }

    if (status === "Leave") {
      return {
        color: "#fbbf24",
        background: "rgba(251, 191, 36, 0.12)"
      };
    }

    return {
      color: "#cbd5e1",
      background: "rgba(148, 163, 184, 0.12)"
    };
  };

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
      color: "#34d399"
    },
    {
      label: "Absent",
      value: absentCount,
      color: "#fb7185"
    },
    {
      label: "Leave",
      value: leaveCount,
      color: "#fbbf24"
    },
    {
      label: "Attendance",
      value: `${percentage}%`,
      color: "#38bdf8"
    }
  ];

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
          My Attendance
        </h1>

        <p className="dashboard-subtitle">
          View your hostel attendance records and attendance percentage.
        </p>
      </div>

      {loading && (
        <div className="dashboard-card">
          <p style={{ color: "#cbd5e1" }}>
            Loading attendance...
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            color: "#fb7185",
            background: "rgba(251, 113, 133, 0.12)"
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="dashboard-grid">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="dashboard-card"
                style={{
                  borderTop: `4px solid ${card.color}`,
                  textAlign: "center"
                }}
              >
                <h2
                  style={{
                    color: card.color,
                    fontSize: "28px",
                    margin: "5px 0"
                  }}
                >
                  {card.value}
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    margin: 0
                  }}
                >
                  {card.label}
                </p>
              </div>
            ))}
          </div>

          <div className="dashboard-card" style={{ marginTop: "25px" }}>
            <h2 style={{ color: "#e5e7eb", marginTop: 0 }}>
              Attendance Records
            </h2>

            {records.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>
                No attendance records found.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: "550px",
                    borderCollapse: "collapse",
                    color: "#e5e7eb"
                  }}
                >
                  <thead>
                    <tr style={{ background: "#0f172a" }}>
                      {["Date", "Status", "Remarks"].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "14px",
                            textAlign: "left",
                            color: "#38bdf8",
                            borderBottom: "1px solid #334155"
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id}>
                        <td style={cellStyle}>
                          {record.date
                            ? new Date(record.date).toLocaleDateString()
                            : "Not specified"}
                        </td>

                        <td style={cellStyle}>
                          <span
                            style={{
                              ...getStatusStyle(record.status),
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontWeight: "600",
                              fontSize: "13px"
                            }}
                          >
                            {record.status}
                          </span>
                        </td>

                        <td style={cellStyle}>
                          {record.remarks || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const cellStyle = {
  padding: "14px",
  textAlign: "left",
  borderBottom: "1px solid #26364b",
  color: "#cbd5e1"
};

export default StudentAttendance;
