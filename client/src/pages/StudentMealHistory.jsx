
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
    <div className="student-meal-history-page">
      <Link
        to="/student-dashboard"
        className="meal-history-back-link"
      >
        ← Back to Student Dashboard
      </Link>

      <div className="meal-history-header">
        <h1>My Meal History</h1>
        <p>
          View your recorded hostel meals and charges.
        </p>
      </div>

      {loading && (
        <div className="meal-history-loading">
          Loading meal records...
        </div>
      )}

      {error && (
        <div className="meal-history-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="meal-charge-card">
            <div className="meal-charge-icon">₹</div>

            <div>
              <p>Total Meal Charges</p>
              <h2>₹{totalCharges.toFixed(2)}</h2>
            </div>
          </div>

          <section className="meal-records-section">
            <div className="meal-records-heading">
              <h2>Meal Records</h2>
              <span>{records.length} Records</span>
            </div>

            {records.length === 0 ? (
              <div className="meal-history-empty">
                <span>🍽️</span>
                <h3>No Meal Records Found</h3>
                <p>
                  Your recorded hostel meals will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="meal-records-table-wrapper">
                  <table className="meal-records-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Meal</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record) => (
                        <tr key={record._id}>
                          <td>
                            {record.date
                              ? new Date(
                                  record.date
                                ).toLocaleDateString()
                              : "Not specified"}
                          </td>

                          <td>
                            <span className="meal-type-label">
                              {record.mealType}
                            </span>
                          </td>

                          <td>{record.quantity}</td>

                          <td>
                            ₹{Number(
                              record.rate || 0
                            ).toFixed(2)}
                          </td>

                          <td className="meal-total-cell">
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

                <div className="meal-mobile-note">
                  Scroll horizontally to view all columns.
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default StudentMealHistory;
