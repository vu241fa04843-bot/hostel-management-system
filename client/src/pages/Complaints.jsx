
import { useEffect, useState } from "react";
import API from "../services/api";

const categories = [
  "Room",
  "Food",
  "Cleaning",
  "Water",
  "Electricity",
  "Wi-Fi",
  "Other",
];

const statuses = ["Pending", "In Progress", "Resolved"];

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    studentId: "",
    title: "",
    category: "Room",
    description: "",
  });

  const [remarks, setRemarks] = useState({});

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [complaintResponse, studentResponse] = await Promise.all([
        API.get("/complaints"),
        API.get("/students"),
      ]);

      const complaintData = complaintResponse.data;
      const studentData = studentResponse.data;

      setComplaints(
        Array.isArray(complaintData)
          ? complaintData
          : complaintData.complaints || []
      );

      setStudents(
        Array.isArray(studentData)
          ? studentData
          : studentData.students || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load complaints. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await API.post("/complaints", form);

      setForm({
        studentId: "",
        title: "",
        category: "Room",
        description: "",
      });

      setMessage("Complaint submitted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not submit the complaint."
      );
    }
  }

  async function handleStatusChange(complaint, status) {
    setError("");
    setMessage("");

    try {
      await API.patch(`/complaints/${complaint._id}`, { status });
      setMessage("Complaint status updated.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update complaint status."
      );
    }
  }

  async function handleSaveRemarks(complaint) {
    setError("");
    setMessage("");

    try {
      await API.patch(`/complaints/${complaint._id}`, {
        adminRemarks:
          remarks[complaint._id] ?? complaint.adminRemarks ?? "",
      });

      setMessage("Admin remarks saved.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save admin remarks."
      );
    }
  }

  async function handleDelete(complaint) {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await API.delete(`/complaints/${complaint._id}`);
      setMessage("Complaint deleted.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not delete complaint."
      );
    }
  }

  const pendingCount = complaints.filter(
    (item) => item.status === "Pending"
  ).length;

  const progressCount = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  function formatDate(dateValue) {
    if (!dateValue) return "—";

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-IN");
  }

  return (
    <main className="complaints-page">
      <header className="complaints-header">
        <div>
          <p className="complaints-eyebrow">ADMINISTRATION</p>
          <h1>Complaint Management</h1>
          <p className="complaints-muted">
            Manage hostel issues, update complaint statuses, and track
            resolutions.
          </p>
        </div>
      </header>

      {error && (
        <div className="complaint-alert complaint-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="complaint-alert complaint-success" role="status">
          {message}
        </div>
      )}

      <section className="complaints-grid">
        <article className="complaint-stat">
          <span>Total Complaints</span>
          <h2>{complaints.length}</h2>
        </article>

        <article className="complaint-stat">
          <span>Pending</span>
          <h2>{pendingCount}</h2>
        </article>

        <article className="complaint-stat">
          <span>In Progress</span>
          <h2>{progressCount}</h2>
        </article>

        <article className="complaint-stat">
          <span>Resolved</span>
          <h2>{resolvedCount}</h2>
        </article>
      </section>

      <section className="complaints-panel">
        <div className="complaint-section-heading">
          <div>
            <h2>Submit a Complaint</h2>
            <p>Create a complaint on behalf of a hostel student.</p>
          </div>
        </div>

        <form className="complaint-form" onSubmit={handleSubmit}>
          <div className="complaint-field">
            <label htmlFor="complaint-student">Student</label>
            <select
              id="complaint-student"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="complaint-field">
            <label htmlFor="complaint-category">Category</label>
            <select
              id="complaint-category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="complaint-field complaint-wide">
            <label htmlFor="complaint-title">Complaint Title</label>
            <input
              id="complaint-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Water leakage in room"
              maxLength={120}
              required
            />
          </div>

          <div className="complaint-field complaint-wide">
            <label htmlFor="complaint-description">Description</label>
            <textarea
              id="complaint-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the problem and where it occurred..."
              maxLength={2000}
              required
            />
          </div>

          <div className="complaint-wide">
            <button
              className="complaint-button"
              type="submit"
              disabled={loading || students.length === 0}
            >
              Submit Complaint
            </button>
          </div>
        </form>

        {!loading && students.length === 0 && (
          <p className="complaints-muted">
            Add a student in Student Management before submitting a complaint.
          </p>
        )}
      </section>

      <section className="complaint-records-section">
        <div className="complaint-section-heading">
          <div>
            <h2>All Complaints</h2>
            <p>Review complaints and manage their progress.</p>
          </div>
          <span className="complaint-record-count">
            {complaints.length} records
          </span>
        </div>

        {loading ? (
          <div className="complaint-empty-state">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="complaint-empty-state">
            No complaints have been submitted yet.
          </div>
        ) : (
          <div className="complaint-list">
            {complaints.map((complaint) => {
              const student = complaint.student || {};

              const badgeClass =
                complaint.status === "Resolved"
                  ? "resolved"
                  : complaint.status === "In Progress"
                    ? "progress"
                    : "";

              return (
                <article className="complaint-card" key={complaint._id}>
                  <div className="complaint-card-header">
                    <div>
                      <p className="complaint-card-label">
                        {complaint.category || "GENERAL"}
                      </p>
                      <h3>{complaint.title}</h3>
                    </div>

                    <span className={`complaint-badge ${badgeClass}`}>
                      {complaint.status}
                    </span>
                  </div>

                  <div className="complaint-details">
                    <p>
                      <strong>Student:</strong> {student.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Student ID:</strong> {student.studentId || "—"}
                    </p>
                    <p>
                      <strong>Room:</strong> {student.roomNumber || "—"}
                    </p>
                    <p>
                      <strong>Submitted:</strong>{" "}
                      {formatDate(complaint.createdAt)}
                    </p>
                  </div>

                  <div className="complaint-description">
                    <strong>Description</strong>
                    <p>{complaint.description}</p>
                  </div>

                  <div className="complaint-field complaint-status-field">
                    <label htmlFor={`status-${complaint._id}`}>
                      Update Status
                    </label>
                    <select
                      id={`status-${complaint._id}`}
                      value={complaint.status}
                      onChange={(event) =>
                        handleStatusChange(complaint, event.target.value)
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="complaint-field complaint-remarks-field">
                    <label htmlFor={`remarks-${complaint._id}`}>
                      Admin Remarks
                    </label>
                    <textarea
                      id={`remarks-${complaint._id}`}
                      value={
                        remarks[complaint._id] ??
                        complaint.adminRemarks ??
                        ""
                      }
                      maxLength={1000}
                      placeholder="Enter action taken or follow-up notes"
                      onChange={(event) =>
                        setRemarks((previous) => ({
                          ...previous,
                          [complaint._id]: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="complaint-actions">
                    <button
                      className="complaint-button"
                      type="button"
                      onClick={() => handleSaveRemarks(complaint)}
                    >
                      Save Remarks
                    </button>

                    <button
                      className="complaint-button delete"
                      type="button"
                      onClick={() => handleDelete(complaint)}
                    >
                      Delete Complaint
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Complaints;
