
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

  const getStatusClass = (status) => {
    if (status === "Approved") return "outing-approved";
    if (status === "Rejected") return "outing-rejected";
    return "outing-pending";
  };

  if (loading) {
    return (
      <div className="student-outings-page">
        <p className="outing-loading">
          Loading outing requests...
        </p>
      </div>
    );
  }

  return (
    <div className="student-outings-page">
      <Link
        to="/student-dashboard"
        className="outing-back-link"
      >
        ← Back to Student Dashboard
      </Link>

      <div className="outing-page-header">
        <h1>My Outing Requests</h1>
        <p>
          Submit outing requests and track Admin approval.
        </p>
      </div>

      {message && (
        <div className="outing-message outing-success">
          {message}
        </div>
      )}

      {error && (
        <div className="outing-message outing-error">
          {error}
        </div>
      )}

      <section className="outing-form-card">
        <h2>New Outing Request</h2>

        <form onSubmit={handleSubmit}>
          <div className="outing-form-group">
            <label htmlFor="destination">Destination</label>
            <input
              id="destination"
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Enter destination"
              required
            />
          </div>

          <div className="outing-form-group">
            <label htmlFor="purpose">Purpose</label>
            <textarea
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Enter outing purpose"
              rows="4"
              required
            />
          </div>

          <div className="outing-date-grid">
            <div className="outing-form-group">
              <label htmlFor="outingDate">
                Outing Date and Time
              </label>
              <input
                id="outingDate"
                type="datetime-local"
                name="outingDate"
                value={form.outingDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="outing-form-group">
              <label htmlFor="returnDate">
                Return Date and Time
              </label>
              <input
                id="returnDate"
                type="datetime-local"
                name="returnDate"
                value={form.returnDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="outing-submit-button"
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Submit Outing Request"}
          </button>
        </form>
      </section>

      <section className="outing-history-section">
        <div className="outing-section-heading">
          <h2>My Outing History</h2>
          <span>{outings.length} Requests</span>
        </div>

        {outings.length === 0 ? (
          <div className="outing-empty-card">
            <h3>No outing requests yet</h3>
            <p>
              Your submitted outing requests will appear here.
            </p>
          </div>
        ) : (
          <div className="outing-history-grid">
            {outings.map((outing) => (
              <article
                key={outing._id}
                className="outing-history-card"
              >
                <div className="outing-card-heading">
                  <h3>{outing.destination}</h3>
                  <span
                    className={`outing-status ${getStatusClass(
                      outing.status
                    )}`}
                  >
                    {outing.status}
                  </span>
                </div>

                <div className="outing-detail">
                  <strong>Purpose</strong>
                  <p>{outing.purpose}</p>
                </div>

                <div className="outing-detail">
                  <strong>Outing Date</strong>
                  <p>
                    {new Date(
                      outing.outingDate
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="outing-detail">
                  <strong>Return Date</strong>
                  <p>
                    {new Date(
                      outing.returnDate
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="outing-remarks">
                  <strong>Admin Remarks</strong>
                  <p>
                    {outing.remarks || "No remarks yet"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentOutings;
