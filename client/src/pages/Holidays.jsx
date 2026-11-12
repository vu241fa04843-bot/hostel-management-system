
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const emptyForm = {
    name: "",
    date: "",
    description: "",
    category: "Other",
  };

  const [form, setForm] = useState(emptyForm);

  const loadHolidays = async () => {
    try {
      setLoading(true);

      const response = await API.get("/holidays");

      setHolidays(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load holidays."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      if (editingId) {
        await API.patch(`/holidays/${editingId}`, form);
        setMessage("Holiday updated successfully!");
      } else {
        await API.post("/holidays", form);
        setMessage("Holiday added successfully!");
      }

      resetForm();
      await loadHolidays();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save holiday."
      );
    } finally {
      setSaving(false);
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

    setMessage("");
    setError("");

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
      setDeletingId(id);
      setMessage("");
      setError("");

      await API.delete(`/holidays/${id}`);

      setMessage("Holiday deleted successfully!");

      if (editingId === id) {
        resetForm();
      }

      await loadHolidays();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete holiday."
      );
    } finally {
      setDeletingId("");
    }
  };

  const categoryClass = (category) => {
    return `holiday-category ${(
      category || "Other"
    ).toLowerCase()}`;
  };

  return (
    <div className="holidays-page">
      <div className="holidays-header">
        <div>
          <h1>Holiday Management</h1>
          <p>
            Manage hostel holidays and important events.
          </p>
        </div>

        <button
          type="button"
          className="holidays-refresh"
          onClick={loadHolidays}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && (
        <div className="holidays-alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="holidays-alert error">
          {error}
        </div>
      )}

      <div className="holidays-summary">
        <div className="holidays-summary-card">
          <span>Total Holidays</span>
          <h2>{holidays.length}</h2>
        </div>

        <div className="holidays-summary-card">
          <span>National</span>
          <h2>
            {holidays.filter(
              (holiday) => holiday.category === "National"
            ).length}
          </h2>
        </div>

        <div className="holidays-summary-card">
          <span>Festival</span>
          <h2>
            {holidays.filter(
              (holiday) => holiday.category === "Festival"
            ).length}
          </h2>
        </div>

        <div className="holidays-summary-card">
          <span>College</span>
          <h2>
            {holidays.filter(
              (holiday) => holiday.category === "College"
            ).length}
          </h2>
        </div>
      </div>

      <section className="holidays-form-section">
        <div className="holidays-section-heading">
          <h2>
            {editingId ? "Update Holiday" : "Add New Holiday"}
          </h2>
          <p>
            Enter the holiday information below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="holidays-form-grid">
            <div className="holidays-field">
              <label htmlFor="holiday-name">
                Holiday Name
              </label>

              <input
                id="holiday-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter holiday name"
                required
              />
            </div>

            <div className="holidays-field">
              <label htmlFor="holiday-date">
                Holiday Date
              </label>

              <input
                id="holiday-date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="holidays-field">
              <label htmlFor="holiday-category">
                Category
              </label>

              <select
                id="holiday-category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="National">National</option>
                <option value="Festival">Festival</option>
                <option value="College">College</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="holidays-field full-width">
              <label htmlFor="holiday-description">
                Description
              </label>

              <textarea
                id="holiday-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter holiday description"
                rows="4"
              />
            </div>
          </div>

          <div className="holidays-form-actions">
            <button
              type="submit"
              className="holidays-submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Holiday"
                  : "Add Holiday"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="holidays-cancel"
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="holidays-list-section">
        <div className="holidays-section-heading">
          <h2>Holiday List</h2>
          <p>All added holidays and important events.</p>
        </div>

        {loading ? (
          <p className="holidays-empty">
            Loading holidays...
          </p>
        ) : holidays.length === 0 ? (
          <p className="holidays-empty">
            No holidays added yet.
          </p>
        ) : (
          <div className="holidays-grid">
            {holidays.map((holiday) => (
              <div
                key={holiday._id}
                className="holiday-card"
              >
                <div className="holiday-card-top">
                  <h3>{holiday.name}</h3>

                  <span className={categoryClass(holiday.category)}>
                    {holiday.category || "Other"}
                  </span>
                </div>

                <div className="holiday-date">
                  <span>Date</span>
                  <strong>
                    {new Date(
                      holiday.date
                    ).toLocaleDateString()}
                  </strong>
                </div>

                <div className="holiday-description">
                  <span>Description</span>
                  <p>
                    {holiday.description || "No description provided."}
                  </p>
                </div>

                <div className="holiday-card-actions">
                  <button
                    type="button"
                    className="holiday-edit"
                    onClick={() => editHoliday(holiday)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="holiday-delete"
                    onClick={() => deleteHoliday(holiday._id)}
                    disabled={deletingId === holiday._id}
                  >
                    {deletingId === holiday._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
