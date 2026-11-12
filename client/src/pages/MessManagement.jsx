import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const initialMenu = {
  date: today(),
  mealType: "Breakfast",
  items: "",
  price: "",
  notes: "",
};

const initialRecord = {
  studentId: "",
  date: today(),
  mealType: "Breakfast",
  quantity: "1",
  rate: "",
};

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "—";
}

function MessManagement() {
  const [menus, setMenus] = useState([]);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [menuForm, setMenuForm] = useState(initialMenu);
  const [recordForm, setRecordForm] = useState(initialRecord);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState("menu");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [menuResponse, recordResponse, studentResponse] =
        await Promise.all([
          API.get("/mess-menus"),
          API.get("/meal-records"),
          API.get("/students"),
        ]);

      setMenus(Array.isArray(menuResponse.data) ? menuResponse.data : []);
      setRecords(Array.isArray(recordResponse.data) ? recordResponse.data : []);
      setStudents(
        Array.isArray(studentResponse.data) ? studentResponse.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load mess data. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalCharges = useMemo(
    () =>
      records.reduce(
        (sum, record) =>
          sum + Number(record.quantity || 0) * Number(record.rate || 0),
        0
      ),
    [records]
  );

  const todayRecords = records.filter(
    (record) => record.date?.slice(0, 10) === today()
  );

  const updateMenuField = (event) => {
    setMenuForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const updateRecordField = (event) => {
    setRecordForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  async function submitMenu(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!menuForm.items.trim() || menuForm.price === "") {
      setError("Enter menu items and a price.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...menuForm,
        price: Number(menuForm.price),
      };

      if (editingMenuId) {
        await API.patch(`/mess-menu/${editingMenuId}`, payload);
        setNotice("Menu updated successfully.");
      } else {
        await API.post("/mess-menu", payload);
        setNotice("Menu added successfully.");
      }

      setMenuForm({ ...initialMenu, date: today() });
      setEditingMenuId(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the menu.");
    } finally {
      setSaving(false);
    }
  }

  function startEditingMenu(menu) {
    setMenuForm({
      date: menu.date?.slice(0, 10) || today(),
      mealType: menu.mealType,
      items: menu.items,
      price: String(menu.price),
      notes: menu.notes || "",
    });

    setEditingMenuId(menu._id);
    setActiveTab("menu");
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteMenu(id) {
    if (!window.confirm("Delete this menu?")) return;

    setError("");
    setNotice("");

    try {
      await API.delete(`/mess-menu/${id}`);
      setNotice("Menu deleted.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete menu.");
    }
  }

  async function submitRecord(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!recordForm.studentId || recordForm.rate === "") {
      setError("Select a student and enter the meal rate.");
      return;
    }

    setSaving(true);

    try {
      await API.post("/meal-records", {
        ...recordForm,
        quantity: Number(recordForm.quantity),
        rate: Number(recordForm.rate),
      });

      setNotice("Meal record added successfully.");

      setRecordForm({
        ...initialRecord,
        date: today(),
        studentId: recordForm.studentId,
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not save the meal record."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm("Delete this meal record?")) return;

    setError("");
    setNotice("");

    try {
      await API.delete(`/meal-records/${id}`);
      setNotice("Meal record deleted.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete the meal record."
      );
    }
  }

  const cancelMenuEdit = () => {
    setEditingMenuId(null);
    setMenuForm({ ...initialMenu, date: today() });
  };

  return (
    <main className="mess-page">
      <header className="mess-header">
        <div>
          <span className="mess-eyebrow">ADMINISTRATION</span>
          <h1>Food &amp; Mess Management</h1>
          <p>
            Manage daily menus, record student meals, and calculate mess
            charges.
          </p>
        </div>

        <button
          className="mess-refresh-button"
          type="button"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className="mess-alert mess-error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="mess-alert mess-success" role="status">
          {notice}
        </div>
      )}

      <section className="mess-summary-grid">
        <SummaryCard
          icon="🍽️"
          label="Menu Entries"
          value={menus.length}
          description="Saved meal menus"
        />
        <SummaryCard
          icon="📋"
          label="Today's Meal Records"
          value={todayRecords.length}
          description="Meals recorded today"
        />
        <SummaryCard
          icon="₹"
          label="Recorded Meal Charges"
          value={`₹${totalCharges.toFixed(2)}`}
          description="Total recorded charges"
        />
      </section>

      <nav className="mess-tabs" aria-label="Mess management sections">
        <button
          type="button"
          className={activeTab === "menu" ? "active" : ""}
          onClick={() => setActiveTab("menu")}
        >
          <span>🍴</span> Manage Menu
        </button>

        <button
          type="button"
          className={activeTab === "records" ? "active" : ""}
          onClick={() => setActiveTab("records")}
        >
          <span>📝</span> Record a Meal
        </button>

        <button
          type="button"
          className={activeTab === "charges" ? "active" : ""}
          onClick={() => setActiveTab("charges")}
        >
          <span>💳</span> Student Charges
        </button>
      </nav>

      {loading ? (
        <div className="mess-loading">Loading mess data...</div>
      ) : (
        <>
          {activeTab === "menu" && (
            <section className="mess-panel">
              <div className="mess-section-heading">
                <div>
                  <h2>{editingMenuId ? "Edit Menu" : "Add Daily Menu"}</h2>
                  <p>Create and maintain the daily hostel food menu.</p>
                </div>
                {editingMenuId && (
                  <span className="mess-edit-label">Editing menu</span>
                )}
              </div>

              <form onSubmit={submitMenu}>
                <div className="mess-form-grid">
                  <Field label="Date">
                    <input
                      type="date"
                      name="date"
                      value={menuForm.date}
                      onChange={updateMenuField}
                      required
                    />
                  </Field>

                  <Field label="Meal">
                    <select
                      name="mealType"
                      value={menuForm.mealType}
                      onChange={updateMenuField}
                      required
                    >
                      {mealTypes.map((meal) => (
                        <option key={meal} value={meal}>
                          {meal}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Price per meal (₹)">
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={menuForm.price}
                      onChange={updateMenuField}
                      placeholder="Enter price"
                      required
                    />
                  </Field>

                  <Field label="Menu items" wide>
                    <textarea
                      name="items"
                      value={menuForm.items}
                      onChange={updateMenuField}
                      placeholder="Example: Idli, sambar, chutney"
                      maxLength={1000}
                      rows={3}
                      required
                    />
                  </Field>

                  <Field label="Notes (optional)" wide>
                    <input
                      name="notes"
                      value={menuForm.notes}
                      onChange={updateMenuField}
                      placeholder="Example: Vegetarian"
                      maxLength={500}
                    />
                  </Field>
                </div>

                <div className="mess-form-actions">
                  <button
                    className="mess-primary-button"
                    disabled={saving}
                    type="submit"
                  >
                    {saving
                      ? "Saving..."
                      : editingMenuId
                        ? "Update Menu"
                        : "Add Menu"}
                  </button>

                  {editingMenuId && (
                    <button
                      className="mess-secondary-button"
                      type="button"
                      onClick={cancelMenuEdit}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <div className="mess-table-section">
                <div className="mess-section-heading">
                  <div>
                    <h2>Saved Menus</h2>
                    <p>All menus currently available in the system.</p>
                  </div>
                  <span className="mess-count">{menus.length} entries</span>
                </div>

                <div className="mess-table-wrap">
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Meal</th>
                        <th>Items</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menus.map((menu) => (
                        <tr key={menu._id}>
                          <td>{formatDate(menu.date)}</td>
                          <td>
                            <span className="mess-meal-badge">
                              {menu.mealType}
                            </span>
                          </td>
                          <td className="mess-items-cell">
                            {menu.items}
                            {menu.notes && (
                              <small className="mess-note">{menu.notes}</small>
                            )}
                          </td>
                          <td>₹{Number(menu.price).toFixed(2)}</td>
                          <td>
                            <div className="mess-row-actions">
                              <button
                                className="mess-small-edit"
                                type="button"
                                onClick={() => startEditingMenu(menu)}
                              >
                                Edit
                              </button>
                              <button
                                className="mess-small-delete"
                                type="button"
                                onClick={() => deleteMenu(menu._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {menus.length === 0 && (
                        <tr>
                          <td colSpan="5" className="mess-empty">
                            No menus added yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "records" && (
            <section className="mess-panel">
              <div className="mess-section-heading">
                <div>
                  <h2>Record a Student Meal</h2>
                  <p>Save meal consumption details for a student.</p>
                </div>
              </div>

              <form onSubmit={submitRecord}>
                <div className="mess-form-grid">
                  <Field label="Student">
                    <select
                      name="studentId"
                      value={recordForm.studentId}
                      onChange={updateRecordField}
                      required
                    >
                      <option value="">Select student</option>
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
                      value={recordForm.date}
                      onChange={updateRecordField}
                      required
                    />
                  </Field>

                  <Field label="Meal">
                    <select
                      name="mealType"
                      value={recordForm.mealType}
                      onChange={updateRecordField}
                      required
                    >
                      {mealTypes.map((meal) => (
                        <option key={meal} value={meal}>
                          {meal}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Quantity">
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      step="1"
                      value={recordForm.quantity}
                      onChange={updateRecordField}
                      required
                    />
                  </Field>

                  <Field label="Rate per meal (₹)">
                    <input
                      type="number"
                      name="rate"
                      min="0"
                      step="0.01"
                      value={recordForm.rate}
                      onChange={updateRecordField}
                      placeholder="Enter rate"
                      required
                    />
                  </Field>
                </div>

                <div className="mess-estimate">
                  <span>Estimated charge</span>
                  <strong>
                    ₹
                    {(
                      Number(recordForm.quantity || 0) *
                      Number(recordForm.rate || 0)
                    ).toFixed(2)}
                  </strong>
                </div>

                <div className="mess-form-actions">
                  <button
                    className="mess-primary-button"
                    disabled={saving || students.length === 0}
                    type="submit"
                  >
                    {saving ? "Saving..." : "Save Meal Record"}
                  </button>
                </div>

                {students.length === 0 && (
                  <p className="mess-help-text">
                    Add a student in Student Management before recording
                    meals.
                  </p>
                )}
              </form>

              <div className="mess-table-section">
                <div className="mess-section-heading">
                  <div>
                    <h2>Recent Meal Records</h2>
                    <p>Recorded meals and their calculated charges.</p>
                  </div>
                  <span className="mess-count">{records.length} records</span>
                </div>

                <div className="mess-table-wrap">
                  <table className="mess-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Date</th>
                        <th>Meal</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record._id}>
                          <td>
                            {record.student?.name || "Student unavailable"}
                          </td>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.mealType}</td>
                          <td>{record.quantity}</td>
                          <td>₹{Number(record.rate).toFixed(2)}</td>
                          <td>
                            ₹
                            {(
                              Number(record.quantity) * Number(record.rate)
                            ).toFixed(2)}
                          </td>
                          <td>
                            <button
                              className="mess-small-delete"
                              type="button"
                              onClick={() => deleteRecord(record._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {records.length === 0 && (
                        <tr>
                          <td colSpan="7" className="mess-empty">
                            No meal records yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "charges" && (
            <section className="mess-panel">
              <div className="mess-section-heading">
                <div>
                  <h2>Student Mess Charges</h2>
                  <p>
                    Charges are calculated from saved meal records and are
                    separate from the Fee Management module.
                  </p>
                </div>
              </div>

              <div className="mess-charge-total">
                <span>Total recorded mess charges</span>
                <strong>₹{totalCharges.toFixed(2)}</strong>
              </div>

              <div className="mess-table-wrap">
                <table className="mess-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Recorded Meals</th>
                      <th>Total Charges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const studentRecords = records.filter(
                        (record) => record.student?._id === student._id
                      );

                      const amount = studentRecords.reduce(
                        (sum, record) =>
                          sum +
                          Number(record.quantity || 0) *
                            Number(record.rate || 0),
                        0
                      );

                      return (
                        <tr key={student._id}>
                          <td>{student.name}</td>
                          <td>{student.studentId || "—"}</td>
                          <td>{studentRecords.length}</td>
                          <td>₹{amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}

                    {students.length === 0 && (
                      <tr>
                        <td colSpan="4" className="mess-empty">
                          No students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function SummaryCard({ icon, label, value, description }) {
  return (
    <article className="mess-summary-card">
      <div className="mess-summary-top">
        <span className="mess-summary-icon">{icon}</span>
        <span className="mess-summary-label">{label}</span>
      </div>
      <h2>{value}</h2>
      <p>{description}</p>
    </article>
  );
}

function Field({ label, children, wide = false }) {
  return (
    <label className={`mess-field ${wide ? "mess-field-wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export default MessManagement;