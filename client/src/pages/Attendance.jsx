import { useEffect, useState } from "react";
import API from "../services/api";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    student: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Present",
    remarks: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [studentResponse, attendanceResponse] =
        await Promise.all([
          API.get("/students"),
          API.get("/attendance"),
        ]);

      setStudents(studentResponse.data);
      setRecords(attendanceResponse.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance data."
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/attendance", form);

      setMessage("Attendance added successfully!");
      setError("");

      setForm({
        student: "",
        date: new Date().toISOString().slice(0, 10),
        status: "Present",
        remarks: "",
      });

      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to add attendance."
      );
      setMessage("");
    }
  };

  const updateStatus = async (record) => {
    const newStatus = window.prompt(
      "Enter Present, Absent or Leave:",
      record.status
    );

    if (!newStatus) return;

    const status = newStatus.trim();

    if (!["Present", "Absent", "Leave"].includes(status)) {
      setError("Please enter a valid attendance status.");
      return;
    }

    try {
      await API.patch(`/attendance/${record._id}`, {
        status,
        remarks: record.remarks || "",
      });

      setMessage("Attendance updated successfully!");
      setError("");
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update attendance."
      );
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this attendance record?")) {
      return;
    }

    try {
      await API.delete(`/attendance/${id}`);

      setMessage("Attendance deleted successfully!");
      setError("");
      loadData();
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
    <div style={styles.container}>
      <h1>Attendance Management</h1>

      <p>Manage and monitor hostel student attendance.</p>

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Total Records</h3>
          <h2>{records.length}</h2>
        </div>

        <div style={styles.card}>
          <h3>Present</h3>
          <h2>{presentCount}</h2>
        </div>

        <div style={styles.card}>
          <h3>Absent</h3>
          <h2>{absentCount}</h2>
        </div>

        <div style={styles.card}>
          <h3>Leave</h3>
          <h2>{leaveCount}</h2>
        </div>
      </div>

      <div style={styles.formContainer}>
        <h2>Mark Student Attendance</h2>

        <form onSubmit={handleSubmit}>
          <label>Student</label>

          <select
            name="student"
            value={form.student}
            onChange={handleChange}
            required
            style={styles.input}
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

          <label>Date</label>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Attendance Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>

          <label>Remarks</label>

          <input
            type="text"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Enter remarks"
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Mark Attendance
          </button>
        </form>
      </div>

      <div style={styles.tableContainer}>
        <h2>Attendance Records</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
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
                  <td colSpan="6">
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
                      {record.student?.studentId || "-"}
                    </td>

                    <td>
                      {new Date(record.date).toLocaleDateString()}
                    </td>

                    <td>{record.status}</td>

                    <td>{record.remarks || "-"}</td>

                    <td>
                      <button
                        onClick={() => updateStatus(record)}
                        style={styles.editButton}
                      >
                        Update
                      </button>

                      <button
                        onClick={() => deleteRecord(record._id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "25px",
    fontFamily: "Arial, sans-serif",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    margin: "20px 0",
  },

  card: {
    background: "#eaf2ff",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
  },

  formContainer: {
    background: "#ffffff",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    maxWidth: "550px",
    marginBottom: "30px",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "8px 0 16px",
    boxSizing: "border-box",
  },

  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },

  tableContainer: {
    marginTop: "25px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  editButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "7px 10px",
    margin: "3px",
    cursor: "pointer",
  },

  deleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "7px 10px",
    margin: "3px",
    cursor: "pointer",
  },
};