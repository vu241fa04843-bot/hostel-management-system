import { useEffect, useState } from "react";
import API from "../services/api";

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    date: "",
    description: "",
    category: "Other",
  });

  const loadHolidays = async () => {
    try {
      const response = await API.get("/holidays");
      setHolidays(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load holidays."
      );
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      date: "",
      description: "",
      category: "Other",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.patch(`/holidays/${editingId}`, form);
        setMessage("Holiday updated successfully!");
      } else {
        await API.post("/holidays", form);
        setMessage("Holiday added successfully!");
      }

      setError("");
      resetForm();
      loadHolidays();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save holiday."
      );
      setMessage("");
    }
  };

  const editHoliday = (holiday) => {
    setEditingId(holiday._id);

    setForm({
      name: holiday.name,
      date: new Date(holiday.date)
        .toISOString()
        .slice(0, 10),
      description: holiday.description || "",
      category: holiday.category || "Other",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday?")) {
      return;
    }

    try {
      await API.delete(`/holidays/${id}`);

      setMessage("Holiday deleted successfully!");
      setError("");

      if (editingId === id) {
        resetForm();
      }

      loadHolidays();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete holiday."
      );
    }
  };

  return (
    <div style={styles.container}>
      <h1>Holiday Management</h1>

      <p>Manage hostel holidays and important events.</p>

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <div style={styles.formContainer}>
        <h2>
          {editingId ? "Update Holiday" : "Add New Holiday"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>Holiday Name</label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter holiday name"
            required
            style={styles.input}
          />

          <label>Holiday Date</label>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="National">National</option>
            <option value="Festival">Festival</option>
            <option value="College">College</option>
            <option value="Other">Other</option>
          </select>

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter holiday description"
            style={styles.input}
          />

          <button type="submit" style={styles.submitButton}>
            {editingId ? "Update Holiday" : "Add Holiday"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div style={styles.listContainer}>
        <h2>Holiday List</h2>

        {holidays.length === 0 ? (
          <p>No holidays added yet.</p>
        ) : (
          <div style={styles.grid}>
            {holidays.map((holiday) => (
              <div key={holiday._id} style={styles.card}>
                <h3>{holiday.name}</h3>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    holiday.date
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {holiday.category}
                </p>

                <p>{holiday.description}</p>

                <button
                  onClick={() => editHoliday(holiday)}
                  style={styles.editButton}
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteHoliday(holiday._id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "25px",
    fontFamily: "Arial, sans-serif",
  },

  formContainer: {
    maxWidth: "550px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
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
    padding: "10px 18px",
    borderRadius: "5px",
    cursor: "pointer",
  },

  cancelButton: {
    marginLeft: "10px",
    padding: "10px 18px",
    cursor: "pointer",
  },

  listContainer: {
    marginTop: "25px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "15px",
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "18px",
    background: "#f8fafc",
  },

  editButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 15px",
    marginRight: "8px",
    cursor: "pointer",
  },

  deleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 15px",
    cursor: "pointer",
  },
};