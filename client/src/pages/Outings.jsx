import { useEffect, useState } from "react";
import API from "../services/api";

export default function Outings() {
  const [students, setStudents] = useState([]);
  const [outings, setOutings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    student: "",
    destination: "",
    purpose: "",
    outingDate: "",
    returnDate: "",
  });

  const loadData = async () => {
    try {
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

    if (
      new Date(form.returnDate) <=
      new Date(form.outingDate)
    ) {
      setError("Return date must be after outing date.");
      return;
    }

    try {
      await API.post("/outings", form);

      setMessage("Outing request submitted successfully!");
      setError("");

      setForm({
        student: "",
        destination: "",
        purpose: "",
        outingDate: "",
        returnDate: "",
      });

      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit outing request."
      );
      setMessage("");
    }
  };

  const updateStatus = async (id, status) => {
    const remarks = window.prompt(
      "Enter remarks (optional):"
    );

    if (remarks === null) return;

    try {
      await API.patch(`/outings/${id}`, {
        status,
        remarks,
      });

      setMessage(`Outing request ${status.toLowerCase()}!`);
      setError("");
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update outing status."
      );
    }
  };

  const deleteOuting = async (id) => {
    if (!window.confirm("Delete this outing request?")) {
      return;
    }

    try {
      await API.delete(`/outings/${id}`);

      setMessage("Outing request deleted successfully!");
      setError("");
      loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete outing request."
      );
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
    <div style={styles.container}>
      <h1>Outing Management</h1>

      <p>Manage student outing requests and approvals.</p>

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>Total Requests</h3>
          <h2>{outings.length}</h2>
        </div>

        <div style={styles.card}>
          <h3>Pending</h3>
          <h2>{pending}</h2>
        </div>

        <div style={styles.card}>
          <h3>Approved</h3>
          <h2>{approved}</h2>
        </div>

        <div style={styles.card}>
          <h3>Rejected</h3>
          <h2>{rejected}</h2>
        </div>
      </div>

      <div style={styles.formContainer}>
        <h2>Submit Outing Request</h2>

        <form onSubmit={handleSubmit}>
          <label>Select Student</label>

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

          <label>Destination</label>

          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            placeholder="Enter destination"
            required
            style={styles.input}
          />

          <label>Purpose</label>

          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="Enter outing purpose"
            required
            style={styles.input}
          />

          <label>Outing Date and Time</label>

          <input
            type="datetime-local"
            name="outingDate"
            value={form.outingDate}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Return Date and Time</label>

          <input
            type="datetime-local"
            name="returnDate"
            value={form.returnDate}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.submitButton}>
            Submit Request
          </button>
        </form>
      </div>

      <div style={styles.tableContainer}>
        <h2>Outing Requests</h2>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
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
                  <td colSpan="8">
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
                      <strong>{item.status}</strong>
                    </td>

                    <td>{item.remarks || "-"}</td>

                    <td>
                      {item.status === "Pending" && (
                        <>
                          <button
                            style={styles.approveButton}
                            onClick={() =>
                              updateStatus(
                                item._id,
                                "Approved"
                              )
                            }
                          >
                            Approve
                          </button>

                          <button
                            style={styles.rejectButton}
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
                        style={styles.deleteButton}
                        onClick={() =>
                          deleteOuting(item._id)
                        }
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
    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",
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
    background: "#fff",
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

  submitButton: {
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

  approveButton: {
    background: "green",
    color: "white",
    padding: "7px",
    border: "none",
    margin: "3px",
    cursor: "pointer",
  },

  rejectButton: {
    background: "orange",
    color: "white",
    padding: "7px",
    border: "none",
    margin: "3px",
    cursor: "pointer",
  },

  deleteButton: {
    background: "#dc2626",
    color: "white",
    padding: "7px",
    border: "none",
    margin: "3px",
    cursor: "pointer",
  },
};