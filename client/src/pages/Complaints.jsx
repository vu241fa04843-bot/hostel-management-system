
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
        adminRemarks: remarks[complaint._id] ?? complaint.adminRemarks ?? "",
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
      <style>{`
        .complaints-page {
          max-width: 1200px;
          margin: auto;
          padding: 28px 18px;
          color: #172033;
          font-family: Arial, sans-serif;
        }
        .complaints-page h1 { margin-bottom: 8px; }
        .complaints-muted { color: #667085; }
        .complaints-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 14px;
          margin: 22px 0;
        }
        .complaints-panel, .complaint-card, .complaint-stat {
          background: white;
          border: 1px solid #e4e7ec;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 3px 12px #1018280a;
        }
        .complaint-stat span { color: #667085; font-size: 14px; }
        .complaint-stat h2 { margin-bottom: 0; font-size: 27px; }
        .complaints-panel { margin-bottom: 24px; }
        .complaint-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          align-items: start;
        }
        .complaint-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .complaint-field label {
          font-weight: 600;
          font-size: 14px;
        }
        .complaint-field input,
        .complaint-field select,
        .complaint-field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px;
          border: 1px solid #d0d5dd;
          border-radius: 7px;
          background: white;
          font: inherit;
        }
        .complaint-field textarea {
          min-height: 100px;
          resize: vertical;
        }
        .complaint-wide { grid-column: 1 / -1; }
        .complaint-button {
          border: 0;
          padding: 11px 15px;
          border-radius: 7px;
          background: #175cd3;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .complaint-button.delete { background: #b42318; }
        .complaint-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 16px;
        }
        .complaint-card h3 { margin-top: 0; overflow-wrap: anywhere; }
        .complaint-card p { overflow-wrap: anywhere; }
        .complaint-badge {
          display: inline-block;
          border-radius: 20px;
          padding: 5px 9px;
          background: #fffaeb;
          color: #b54708;
          font-size: 12px;
          font-weight: 700;
        }
        .complaint-badge.progress {
          background: #eff8ff;
          color: #175cd3;
        }
        .complaint-badge.resolved {
          background: #ecfdf3;
          color: #027a48;
        }
        .complaint-error, .complaint-success {
          padding: 12px;
          margin: 14px 0;
          border-radius: 8px;
        }
        .complaint-error { background: #fef3f2; color: #b42318; }
        .complaint-success { background: #ecfdf3; color: #027a48; }
        @media (max-width: 500px) {
          .complaints-page { padding: 18px 10px; }
          .complaint-wide { grid-column: auto; }
        }
      `}</style>

      <h1>Complaint Management</h1>
      <p className="complaints-muted">
        Submit hostel issues and track their progress.
      </p>

      {error && <div className="complaint-error" role="alert">{error}</div>}
      {message && <div className="complaint-success" role="status">{message}</div>}

      <section className="complaints-grid">
        <div className="complaint-stat">
          <span>Total Complaints</span>
          <h2>{complaints.length}</h2>
        </div>
        <div className="complaint-stat">
          <span>Pending</span>
          <h2>{pendingCount}</h2>
        </div>
        <div className="complaint-stat">
          <span>In Progress</span>
          <h2>{progressCount}</h2>
        </div>
        <div className="complaint-stat">
          <span>Resolved</span>
          <h2>{resolvedCount}</h2>
        </div>
      </section>

      <section className="complaints-panel">
        <h2>Submit a Complaint</h2>

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

      <section>
        <h2>All Complaints</h2>

        {loading ? (
          <p>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints have been submitted yet.</p>
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
                  <h3>{complaint.title}</h3>

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
                    <strong>Category:</strong> {complaint.category}
                  </p>
                  <p>
                    <strong>Description:</strong> {complaint.description}
                  </p>
                  <p>
                    <strong>Submitted:</strong> {formatDate(complaint.createdAt)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`complaint-badge ${badgeClass}`}>
                      {complaint.status}
                    </span>
                  </p>

                  <div className="complaint-field">
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

                  <div className="complaint-field" style={{ marginTop: 14 }}>
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

                  <button
                    className="complaint-button"
                    type="button"
                    style={{ marginTop: 10, marginRight: 8 }}
                    onClick={() => handleSaveRemarks(complaint)}
                  >
                    Save Remarks
                  </button>

                  <button
                    className="complaint-button delete"
                    type="button"
                    style={{ marginTop: 10 }}
                    onClick={() => handleDelete(complaint)}
                  >
                    Delete Complaint
                  </button>
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