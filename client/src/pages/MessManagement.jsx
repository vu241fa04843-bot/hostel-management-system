
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

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#172033",
  marginTop: "5px",
};

const buttonStyle = {
  padding: "9px 14px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "—";
}

export default function MessManagement() {
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
      setStudents(Array.isArray(studentResponse.data) ? studentResponse.data : []);
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
      setError(
        err.response?.data?.message || "Could not save the menu."
      );
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

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "8px" }}>Food &amp; Mess Management</h1>
        <p style={{ color: "#64748b" }}>
          Manage daily menus, record meals, and calculate student mess charges.
        </p>
      </header>

      {error && (
        <div role="alert" style={messageStyle("#fee2e2", "#991b1b")}>
          {error}
        </div>
      )}

      {notice && (
        <div role="status" style={messageStyle("#dcfce7", "#166534")}>
          {notice}
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <SummaryCard label="Menu entries" value={menus.length} />
        <SummaryCard label="Today's meal records" value={todayRecords.length} />
        <SummaryCard
          label="Recorded meal charges"
          value={`₹${totalCharges.toFixed(2)}`}
        />
      </section>

      <nav style={{ display: "flex", gap: "10px", marginBottom: "22px", flexWrap: "wrap" }}>
        <button
          style={buttonStyle}
          onClick={() => setActiveTab("menu")}
        >
          Manage Menu
        </button>
        <button
          style={buttonStyle}
          onClick={() => setActiveTab("records")}
        >
          Record a Meal
        </button>
        <button
          style={buttonStyle}
          onClick={() => setActiveTab("charges")}
        >
          Student Charges
        </button>
      </nav>

      {loading ? (
        <p>Loading mess data...</p>
      ) : (
        <>
          {activeTab === "menu" && (
            <section style={panelStyle}>
              <h2>{editingMenuId ? "Edit Menu" : "Add Daily Menu"}</h2>

              <form onSubmit={submitMenu}>
                <div style={gridStyle}>
                  <Field label="Date">
                    <input
                      style={inputStyle}
                      type="date"
                      name="date"
                      value={menuForm.date}
                      onChange={updateMenuField}
                      required
                    />
                  </Field>

                  <Field label="Meal">
                    <select
                      style={inputStyle}
                      name="mealType"
                      value={menuForm.mealType}
                      onChange={updateMenuField}
                      required
                    >
                      {mealTypes.map((meal) => (
                        <option key={meal} value={meal}>{meal}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Price per meal (₹)">
                    <input
                      style={inputStyle}
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={menuForm.price}
                      onChange={updateMenuField}
                      required
                    />
                  </Field>
                </div>

                <Field label="Menu items">
                  <textarea
                    style={inputStyle}
                    name="items"
                    value={menuForm.items}
                    onChange={updateMenuField}
                    placeholder="Example: Idli, sambar, chutney"
                    maxLength={1000}
                    required
                  />
                </Field>

                <Field label="Notes (optional)">
                  <input
                    style={inputStyle}
                    name="notes"
                    value={menuForm.notes}
                    onChange={updateMenuField}
                    placeholder="Example: Vegetarian"
                    maxLength={500}
                  />
                </Field>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button disabled={saving} style={buttonStyle} type="submit">
                    {saving ? "Saving..." : editingMenuId ? "Update Menu" : "Add Menu"}
                  </button>
                  {editingMenuId && (
                    <button
                      style={buttonStyle}
                      type="button"
                      onClick={() => {
                        setEditingMenuId(null);
                        setMenuForm({ ...initialMenu, date: today() });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              <h2 style={{ marginTop: "30px" }}>Saved Menus</h2>
              <div style={tableWrapStyle}>
                <table style={tableStyle}>
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
                        <td>{menu.mealType}</td>
                        <td>
                          {menu.items}
                          {menu.notes && <small><br />{menu.notes}</small>}
                        </td>
                        <td>₹{Number(menu.price).toFixed(2)}</td>
                        <td>
                          <button
                            style={buttonStyle}
                            onClick={() => startEditingMenu(menu)}
                          >
                            Edit
                          </button>{" "}
                          <button
                            style={buttonStyle}
                            onClick={() => deleteMenu(menu._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {menus.length === 0 && (
                      <tr><td colSpan="5">No menus added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "records" && (
            <section style={panelStyle}>
              <h2>Record a Student Meal</h2>

              <form onSubmit={submitRecord}>
                <div style={gridStyle}>
                  <Field label="Student">
                    <select
                      style={inputStyle}
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
                      style={inputStyle}
                      type="date"
                      name="date"
                      value={recordForm.date}
                      onChange={updateRecordField}
                      required
                    />
                  </Field>

                  <Field label="Meal">
                    <select
                      style={inputStyle}
                      name="mealType"
                      value={recordForm.mealType}
                      onChange={updateRecordField}
                      required
                    >
                      {mealTypes.map((meal) => (
                        <option key={meal} value={meal}>{meal}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Quantity">
                    <input
                      style={inputStyle}
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
                      style={inputStyle}
                      type="number"
                      name="rate"
                      min="0"
                      step="0.01"
                      value={recordForm.rate}
                      onChange={updateRecordField}
                      required
                    />
                  </Field>
                </div>

                <p>
                  Estimated charge:{" "}
                  <strong>
                    ₹{(
                      Number(recordForm.quantity || 0) *
                      Number(recordForm.rate || 0)
                    ).toFixed(2)}
                  </strong>
                </p>

                <button disabled={saving || students.length === 0} style={buttonStyle}>
                  {saving ? "Saving..." : "Save Meal Record"}
                </button>

                {students.length === 0 && (
                  <p>Add a student in Student Management before recording meals.</p>
                )}
              </form>

              <h2 style={{ marginTop: "30px" }}>Recent Meal Records</h2>
              <div style={tableWrapStyle}>
                <table style={tableStyle}>
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
                        <td>{record.student?.name || "Student unavailable"}</td>
                        <td>{formatDate(record.date)}</td>
                        <td>{record.mealType}</td>
                        <td>{record.quantity}</td>
                        <td>₹{Number(record.rate).toFixed(2)}</td>
                        <td>
                          ₹{(
                            Number(record.quantity) * Number(record.rate)
                          ).toFixed(2)}
                        </td>
                        <td>
                          <button
                            style={buttonStyle}
                            onClick={() => deleteRecord(record._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr><td colSpan="7">No meal records yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "charges" && (
            <section style={panelStyle}>
              <h2>Student Mess Charges</h2>
              <p>
                Charges are calculated from saved meal records. They are
                separate from the existing Fee Management module.
              </p>

              <div style={tableWrapStyle}>
                <table style={tableStyle}>
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
                      <tr><td colSpan="4">No students found.</td></tr>
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

function SummaryCard({ label, value }) {
  return (
    <article
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "#eff6ff",
        border: "1px solid #dbeafe",
      }}
    >
      <p style={{ margin: 0, color: "#475569" }}>{label}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </article>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: "14px" }}>
      <span style={{ fontWeight: "600" }}>{label}</span>
      {children}
    </label>
  );
}

function messageStyle(background, color) {
  return {
    background,
    color,
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "14px",
  };
}

const panelStyle = {
  background: "#ffffff",
  padding: "22px",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  marginBottom: "24px",
  overflow: "hidden",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "12px",
};

const tableWrapStyle = {
  overflowX: "auto",
  width: "100%",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
  marginTop: "12px",
};
