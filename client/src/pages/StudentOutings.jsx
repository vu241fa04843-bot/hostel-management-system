
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentOutings() {
  const [outings, setOutings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    destination: "",
    purpose: "",
    outingDate: "",
    returnDate: ""
  });

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const loadOutings = async () => {
    try {
      const response = await API.get("/student-outings", {
        headers
      });

      setOutings(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load outing requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutings();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      new Date(form.returnDate) <=
      new Date(form.outingDate)
    ) {
      setError("Return date must be after outing date.");
      return;
    }

    setSubmitting(true);

    try {
      await API.post("/student-outings", form, {
        headers
      });

      setMessage("Outing request submitted successfully!");

      setForm({
        destination: "",
        purpose: "",
        outingDate: "",
        returnDate: ""
      });

      await loadOutings();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit outing request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Approved") {
      return {
        color: "#34d399",
        background: "rgba(52, 211, 153, 0.12)"
      };
    }

    if (status === "Rejected") {
      return {
        color: "#fb7185",
        background: "rgba(251, 113, 133, 0.12)"
      };
    }

    return {
      color: "#fbbf24",
      background: "rgba(251, 191, 36, 0.12)"
    };
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "18px",
    boxSizing: "border-box",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#0f172a",
    color: "#e5e7eb",
    fontSize: "14px",
    outline: "none"
  };

  const labelStyle = {
    color: "#cbd5e1",
    fontWeight: "600",
    fontSize: "14px"
  };

  if (loading) {
    return (
      <div className="dashboard-main">
        <p style={{ color: "#cbd5e1" }}>
          Loading outing requests...
        </p>
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
          My Outing Requests
        </h1>

        <p className="dashboard-subtitle">
          Submit outing requests and track Admin approval.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "18px",
            borderRadius: "8px",
            color: "#34d399",
            background: "rgba(52, 211, 153, 0.12)"
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "18px",
            borderRadius: "8px",
            color: "#fb7185",
            background: "rgba(251, 113, 133, 0.12)"
          }}
        >
          {error}
        </div>
      )}

      <div
        className="dashboard-card"
        style={{
          maxWidth: "650px",
          marginBottom: "30px"
        }}
      >
        <h2 style={{ color: "#e5e7eb", marginTop: 0 }}>
          New Outing Request
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Destination</label>

          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            placeholder="Enter destination"
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Purpose</label>

          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="Enter outing purpose"
            required
            rows="4"
            style={{
              ...inputStyle,
              resize: "vertical"
            }}
          />

          <label style={labelStyle}>
            Outing Date and Time
          </label>

          <input
            type="datetime-local"
            name="outingDate"
            value={form.outingDate}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>
            Return Date and Time
          </label>

          <input
            type="datetime-local"
            name="returnDate"
            value={form.returnDate}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={submitting}
            className="dashboard-button"
            style={{
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Submitting..." : "Submit Outing Request"}
          </button>
        </form>
      </div>

      <div className="dashboard-section">
        <h2 style={{ color: "#e5e7eb" }}>
          My Outing History
        </h2>

        {outings.length === 0 ? (
          <div className="dashboard-card">
            <p style={{ color: "#94a3b8" }}>
              No outing requests submitted yet.
            </p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {outings.map((outing) => (
              <div
                key={outing._id}
                className="dashboard-card"
                style={{
                  borderLeft: "4px solid #38bdf8"
                }}
              >
                <h3 style={{ color: "#e5e7eb", marginTop: 0 }}>
                  {outing.destination}
                </h3>

                <p style={{ color: "#cbd5e1" }}>
                  <strong>Purpose:</strong> {outing.purpose}
                </p>

                <p style={{ color: "#cbd5e1" }}>
                  <strong>Outing Date:</strong>{" "}
                  {new Date(outing.outingDate).toLocaleString()}
                </p>

                <p style={{ color: "#cbd5e1" }}>
                  <strong>Return Date:</strong>{" "}
                  {new Date(outing.returnDate).toLocaleString()}
                </p>

                <p style={{ color: "#cbd5e1" }}>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      ...getStatusStyle(outing.status),
                      padding: "5px 10px",
                      borderRadius: "20px",
                      fontWeight: "600",
                      fontSize: "13px"
                    }}
                  >
                    {outing.status}
                  </span>
                </p>

                <p style={{ color: "#cbd5e1" }}>
                  <strong>Admin Remarks:</strong>{" "}
                  {outing.remarks || "No remarks yet"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentOutings;
