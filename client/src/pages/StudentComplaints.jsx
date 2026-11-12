
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
      setError(
        err.response?.data?.message || "Unable to load complaints"
      );
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
      setError(
        err.response?.data?.message || "Unable to submit complaint"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Resolved") return "resolved";
    if (status === "In Progress") return "in-progress";
    return "pending";
  };

  if (loading) {
    return (
      <main className="student-complaints-page">
        <p className="complaint-info">Loading complaints...</p>
      </main>
    );
  }

  return (
    <main className="student-complaints-page">

      <Link
        to="/student-dashboard"
        className="complaint-back-link"
      >
        ← Back to Dashboard
      </Link>

      <header className="complaint-page-header">
        <h1>Student Complaints</h1>
        <p>
          Submit hostel complaints and track their progress.
        </p>
      </header>

      {message && (
        <div className="complaint-success">
          {message}
        </div>
      )}

      {error && (
        <div className="complaint-error">
          {error}
        </div>
      )}

      {/* Complaint Form */}
      <section className="complaint-form-card">
        <h2>Submit New Complaint</h2>
        <p className="complaint-description">
          Provide the details of your issue below.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="complaint-form-group">
            <label htmlFor="complaint-title">
              Complaint Title
            </label>

            <input
              id="complaint-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter complaint title"
              maxLength={120}
              required
            />
          </div>

          <div className="complaint-form-group">
            <label htmlFor="complaint-category">
              Category
            </label>

            <select
              id="complaint-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                "Room",
                "Food",
                "Cleaning",
                "Water",
                "Electricity",
                "Wi-Fi",
                "Other"
              ].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="complaint-form-group">
            <label htmlFor="complaint-description">
              Description
            </label>

            <textarea
              id="complaint-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your complaint"
              maxLength={2000}
              required
              rows={5}
            />
          </div>

          <button
            type="submit"
            className="complaint-submit-button"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>

        </form>
      </section>

      {/* Complaint History */}
      <section className="complaint-history-section">
        <h2>My Complaint History</h2>

        {complaints.length === 0 ? (
          <div className="complaint-empty-card">
            You have not submitted any complaints yet.
          </div>
        ) : (
          <div className="complaint-history-grid">

            {complaints.map((complaint) => (
              <article
                className="complaint-history-card"
                key={complaint._id}
              >
                <div className="complaint-card-header">
                  <h3>{complaint.title}</h3>

                  <span
                    className={`complaint-status ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {complaint.status || "Pending"}
                  </span>
                </div>

                <div className="complaint-detail">
                  <strong>Category</strong>
                  <span>{complaint.category || "-"}</span>
                </div>

                <div className="complaint-detail">
                  <strong>Description</strong>
                  <span>{complaint.description || "-"}</span>
                </div>

                <div className="complaint-detail">
                  <strong>Admin Remarks</strong>
                  <span>
                    {complaint.adminRemarks || "No remarks yet"}
                  </span>
                </div>

                <p className="complaint-date">
                  Submitted:{" "}
                  {complaint.createdAt
                    ? new Date(
                        complaint.createdAt
                      ).toLocaleDateString()
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
