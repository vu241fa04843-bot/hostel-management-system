
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Room");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    try {
      const response = await API.get("/student-complaints", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      await API.post(
        "/student-complaints",
        { title, category, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Complaint submitted successfully!");
      setTitle("");
      setCategory("Room");
      setDescription("");
      await fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return { color: "#34d399", background: "#064e3b" };
    }
    if (status === "In Progress") {
      return { color: "#fbbf24", background: "#713f12" };
    }
    return { color: "#fb7185", background: "#881337" };
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "18px",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#0f172a",
    color: "#f8fafc",
    boxSizing: "border-box",
    fontSize: "15px"
  };

  if (loading) {
    return <main className="dashboard-main">Loading complaints...</main>;
  }

  return (
    <main className="dashboard-main" style={{ minHeight: "100vh" }}>
      <Link
        to="/student-dashboard"
        style={{ color: "#38bdf8", textDecoration: "none" }}
      >
        ← Back to Dashboard
      </Link>

      <header className="dashboard-topbar" style={{ marginTop: "22px" }}>
        <div>
          <h1 className="dashboard-title">Student Complaints</h1>
          <p className="dashboard-subtitle">
            Submit hostel complaints and track their progress.
          </p>
        </div>
      </header>

      {message && (
        <p style={{ color: "#34d399", background: "#064e3b", padding: "12px", borderRadius: "8px" }}>
          {message}
        </p>
      )}

      {error && (
        <p className="dashboard-error">{error}</p>
      )}

      <section className="dashboard-card" style={{ maxWidth: "700px" }}>
        <h2 style={{ color: "#f8fafc" }}>Submit New Complaint</h2>

        <form onSubmit={handleSubmit}>
          <label>Complaint Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter complaint title"
            maxLength={120}
            required
            style={inputStyle}
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            {["Room", "Food", "Cleaning", "Water", "Electricity", "Wi-Fi", "Other"].map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain your complaint"
            maxLength={2000}
            required
            rows={5}
            style={inputStyle}
          />

          <button
            type="submit"
            className="dashboard-button"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </section>

      <section className="dashboard-section">
        <h2>My Complaint History</h2>

        {complaints.length === 0 ? (
          <div className="dashboard-card">
            You have not submitted any complaints yet.
          </div>
        ) : (
          <div className="dashboard-grid">
            {complaints.map(complaint => (
              <article className="dashboard-card" key={complaint._id}>
                <div className="dashboard-topbar">
                  <h3 style={{ color: "#f8fafc", margin: 0 }}>
                    {complaint.title}
                  </h3>

                  <span style={{
                    ...getStatusStyle(complaint.status),
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {complaint.status || "Pending"}
                  </span>
                </div>

                <p><strong>Category:</strong> {complaint.category}</p>
                <p><strong>Description:</strong> {complaint.description}</p>
                <p>
                  <strong>Admin Remarks:</strong>{" "}
                  {complaint.adminRemarks || "No remarks yet"}
                </p>
                <p className="dashboard-subtitle">
                  Submitted: {complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleDateString()
                    : "Not available"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentComplaints;
