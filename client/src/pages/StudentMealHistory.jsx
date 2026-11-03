
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentMealHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await API.get("/student-meals/my-meals");

      setRecords(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your meal history."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalCharges = records.reduce(
    (sum, record) =>
      sum +
      Number(record.quantity || 0) *
      Number(record.rate || 0),
    0
  );

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
          My Meal History
        </h1>

        <p className="dashboard-subtitle">
          View your recorded hostel meals and charges.
        </p>
      </div>

      {loading && (
        <div className="dashboard-card">
          <p style={{ color: "#cbd5e1" }}>
            Loading meal records...
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
          <div
            className="dashboard-card"
            style={{
              marginBottom: "25px",
              borderLeft: "4px solid #34d399"
            }}
          >
            <p
              style={{
                color: "#94a3b8",
                margin: "0 0 10px"
              }}
            >
              Total Meal Charges
            </p>

            <h2
              style={{
                color: "#34d399",
                fontSize: "28px",
                margin: 0
              }}
            >
              ₹{totalCharges.toFixed(2)}
            </h2>
          </div>

          <div className="dashboard-card">
            <h2 style={{ color: "#e5e7eb", marginTop: 0 }}>
              Meal Records
            </h2>

            {records.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>
                No meal records found.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "650px",
                    color: "#e5e7eb"
                  }}
                >
                  <thead>
                    <tr style={{ background: "#0f172a" }}>
                      {[
                        "Date",
                        "Meal",
                        "Quantity",
                        "Rate",
                        "Total"
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "14px",
                            textAlign: "left",
                            borderBottom: "1px solid #334155",
                            color: "#38bdf8"
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
                          {record.mealType}
                        </td>

                        <td style={cellStyle}>
                          {record.quantity}
                        </td>

                        <td style={cellStyle}>
                          ₹{Number(record.rate || 0).toFixed(2)}
                        </td>

                        <td
                          style={{
                            ...cellStyle,
                            color: "#34d399",
                            fontWeight: "600"
                          }}
                        >
                          ₹{(
                            Number(record.quantity || 0) *
                            Number(record.rate || 0)
                          ).toFixed(2)}
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
  borderBottom: "1px solid #26364b",
  color: "#cbd5e1"
};

export default StudentMealHistory;
