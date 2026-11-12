
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Outings() {
  const [students, setStudents] = useState([]);
  const [outings, setOutings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const emptyForm = {
    student: "",
    destination: "",
    purpose: "",
    outingDate: "",
    returnDate: "",
  };

  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);

      const [studentResponse, outingResponse] =
        await Promise.all([
          API.get("/students"),
          API.get("/outings"),
        ]);

      setStudents(studentResponse.data);
      setOutings(outingResponse.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load outing data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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

    try {
      setSubmitting(true);

      await API.post("/outings", form);

      setMessage("Outing request submitted successfully!");
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit outing request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    const remarks = window.prompt(
      "Enter remarks (optional):"
    );

    if (remarks === null) return;

    try {
      setUpdatingId(id);
      setMessage("");
      setError("");

      await API.patch(`/outings/${id}`, {
        status,
        remarks,
      });

      setMessage(
        `Outing request ${status.toLowerCase()}!`
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update outing status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const deleteOuting = async (id) => {
    if (!window.confirm("Delete this outing request?")) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      await API.delete(`/outings/${id}`);

      setMessage("Outing request deleted successfully!");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete outing request."
      );
    } finally {
      setDeletingId("");
    }
  };

  const pending = outings.filter(
    (item) => item.status === "Pending"
  ).length;

  const approved = outings.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejected = outings.filter(
    (item) => item.status === "Rejected"
  ).length;

  return (
    <div className="outings-page">
      <div className="outings-header">
        <div>
          <h1>Outing Management</h1>
          <p>
            Manage student outing requests and approvals.
          </p>
        </div>

        <button
          type="button"
          className="outings-refresh"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && (
        <div className="outings-alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="outings-alert error">
          {error}
        </div>
      )}

      <div className="outings-stats">
        <div className="outings-stat-card">
          <span>Total Requests</span>
          <h2>{outings.length}</h2>
        </div>

        <div className="outings-stat-card pending">
          <span>Pending</span>
          <h2>{pending}</h2>
        </div>

        <div className="outings-stat-card approved">
          <span>Approved</span>
          <h2>{approved}</h2>
        </div>

        <div className="outings-stat-card rejected">
          <span>Rejected</span>
          <h2>{rejected}</h2>
        </div>
      </div>

      <section className="outings-form-section">
        <div className="outings-section-heading">
          <h2>Submit Outing Request</h2>
          <p>Enter the student's outing details below.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="outings-form-grid">
            <div className="outings-field full-width">
              <label htmlFor="outing-student">
                Select Student
              </label>

              <select
                id="outing-student"
                name="student"
                value={form.student}
                onChange={handleChange}
                required
              >
                <option value="">Select Student</option>

                {students.map((student) => (
                  <option
                    key={student._id}
                    value={student._id}
                  >
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div className="outings-field">
              <label htmlFor="outing-destination">
                Destination
              </label>

              <input
                id="outing-destination"
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="Enter destination"
                required
              />
            </div>

            <div className="outings-field">
              <label htmlFor="outing-purpose">
                Purpose
              </label>

              <input
                id="outing-purpose"
                type="text"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="Enter outing purpose"
                required
              />
            </div>

            <div className="outings-field">
              <label htmlFor="outing-date">
                Outing Date and Time
              </label>

              <input
                id="outing-date"
                type="datetime-local"
                name="outingDate"
                value={form.outingDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="outings-field">
              <label htmlFor="return-date">
                Return Date and Time
              </label>

              <input
                id="return-date"
                type="datetime-local"
                name="returnDate"
                value={form.returnDate}
                onChange={handleChange}
                min={form.outingDate || undefined}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="outings-submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </section>

      <section className="outings-table-section">
        <div className="outings-section-heading">
          <h2>Outing Requests</h2>
          <p>View and manage all student outing requests.</p>
        </div>

        {loading ? (
          <p className="outings-empty">Loading outing requests...</p>
        ) : (
          <div className="outings-table-wrapper">
            <table className="outings-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Destination</th>
                  <th>Purpose</th>
                  <th>Outing Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {outings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="outings-empty">
                      No outing requests found.
                    </td>
                  </tr>
                ) : (
                  outings.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.student?.name || "Unknown"}
                      </td>

                      <td>{item.destination}</td>

                      <td>{item.purpose}</td>

                      <td>
                        {new Date(
                          item.outingDate
                        ).toLocaleString()}
                      </td>

                      <td>
                        {new Date(
                          item.returnDate
                        ).toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={`outings-status ${item.status?.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>{item.remarks || "-"}</td>

                      <td>
                        <div className="outings-actions">
                          {item.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                className="outings-approve"
                                disabled={updatingId === item._id}
                                onClick={() =>
                                  updateStatus(
                                    item._id,
                                    "Approved"
                                  )
                                }
                              >
                                {updatingId === item._id
                                  ? "Updating..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                className="outings-reject"
                                disabled={updatingId === item._id}
                                onClick={() =>
                                  updateStatus(
                                    item._id,
                                    "Rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="outings-delete"
                            disabled={deletingId === item._id}
                            onClick={() =>
                              deleteOuting(item._id)
                            }
                          >
                            {deletingId === item._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
