import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  student: "",
  date: today(),
  status: "Present",
  remarks: "",
};

const attendanceStatuses = ["Present", "Absent", "Leave"];

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "—";
}

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("Present");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [studentResponse, attendanceResponse] = await Promise.all([
        API.get("/students"),
        API.get("/attendance"),
      ]);

      setStudents(
        Array.isArray(studentResponse.data) ? studentResponse.data : []
      );

      setRecords(
        Array.isArray(attendanceResponse.data)
          ? attendanceResponse.data
          : []
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    setSaving(true);

    try {
      await API.post("/attendance", form);

      setMessage("Attendance added successfully!");

      setForm({
        ...initialForm,
        date: today(),
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (record) => {
    setEditingId(record._id);
    setEditingStatus(record.status);
    setError("");
    setMessage("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingStatus("Present");
  };

  const updateStatus = async (record) => {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await API.patch(`/attendance/${record._id}`, {
        status: editingStatus,
        remarks: record.remarks || "",
      });

      setMessage("Attendance updated successfully!");
      cancelEditing();
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this attendance record?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await API.delete(`/attendance/${id}`);

      setMessage("Attendance deleted successfully!");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete attendance."
      );
    }
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

  return (
    <main className="attendance-page">
      <header className="attendance-header">
        <div>
          <span className="attendance-eyebrow">ADMINISTRATION</span>
          <h1>Attendance Management</h1>
          <p>
            Manage and monitor hostel student attendance records.
          </p>
        </div>

        <button
          type="button"
          className="attendance-refresh"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {message && (
        <div className="attendance-alert attendance-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="attendance-alert attendance-error" role="alert">
          {error}
        </div>
      )}

      <section className="attendance-summary-grid">
        <SummaryCard
          icon="📋"
          label="Total Records"
          value={records.length}
          description="All attendance entries"
        />

        <SummaryCard
          icon="✅"
          label="Present"
          value={presentCount}
          description="Present records"
        />

        <SummaryCard
          icon="❌"
          label="Absent"
          value={absentCount}
          description="Absent records"
        />

        <SummaryCard
          icon="🗓️"
          label="Leave"
          value={leaveCount}
          description="Leave records"
        />
      </section>

      <section className="attendance-panel">
        <div className="attendance-section-heading">
          <div>
            <h2>Mark Student Attendance</h2>
            <p>Enter the student's details and attendance status.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="attendance-form-grid">
            <Field label="Student">
              <select
                name="student"
                value={form.student}
                onChange={handleChange}
                required
              >
                <option value="">Select Student</option>

                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId || student._id})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </Field>

            <Field label="Attendance Status">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                {attendanceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Remarks">
              <input
                type="text"
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks (optional)"
              />
            </Field>
          </div>

          <div className="attendance-form-actions">
            <button
              type="submit"
              className="attendance-primary-button"
              disabled={saving || students.length === 0}
            >
              {saving ? "Saving..." : "Mark Attendance"}
            </button>
          </div>

          {students.length === 0 && !loading && (
            <p className="attendance-help-text">
              Add a student in Student Management before marking attendance.
            </p>
          )}
        </form>
      </section>

      <section className="attendance-panel attendance-records-panel">
        <div className="attendance-section-heading">
          <div>
            <h2>Attendance Records</h2>
            <p>View, update, and delete student attendance entries.</p>
          </div>

          <span className="attendance-count">
            {records.length} records
          </span>
        </div>

        {loading ? (
          <div className="attendance-loading">
            Loading attendance records...
          </div>
        ) : (
          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="attendance-empty">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record._id}>
                      <td>
                        {record.student?.name || "Unknown"}
                      </td>

                      <td>
                        {record.student?.studentId || "—"}
                      </td>

                      <td>{formatDate(record.date)}</td>

                      <td>
                        {editingId === record._id ? (
                          <select
                            className="attendance-status-select"
                            value={editingStatus}
                            onChange={(e) =>
                              setEditingStatus(e.target.value)
                            }
                          >
                            {attendanceStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={record.status} />
                        )}
                      </td>

                      <td>{record.remarks || "—"}</td>

                      <td>
                        {editingId === record._id ? (
                          <div className="attendance-row-actions">
                            <button
                              type="button"
                              className="attendance-save-button"
                              disabled={saving}
                              onClick={() => updateStatus(record)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              className="attendance-cancel-button"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="attendance-row-actions">
                            <button
                              type="button"
                              className="attendance-edit-button"
                              onClick={() => startEditing(record)}
                            >
                              Update
                            </button>

                            <button
                              type="button"
                              className="attendance-delete-button"
                              onClick={() => deleteRecord(record._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryCard({ icon, label, value, description }) {
  return (
    <article className="attendance-summary-card">
      <div className="attendance-summary-top">
        <span className="attendance-summary-icon">{icon}</span>
        <span className="attendance-summary-label">{label}</span>
      </div>

      <h2>{value}</h2>
      <p>{description}</p>
    </article>
  );
}

function Field({ label, children }) {
  return (
    <label className="attendance-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "Present"
      ? "present"
      : status === "Absent"
        ? "absent"
        : "leave";

  return (
    <span className={`attendance-status-badge ${className}`}>
      {status}
    </span>
  );
}