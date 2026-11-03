
import { useEffect, useState } from "react";
import API from "../services/api";

function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [feeForm, setFeeForm] = useState({
    studentId: "",
    billingPeriod: "",
    totalFee: "",
    dueDate: "",
    notes: "",
  });

  const [paymentForms, setPaymentForms] = useState({});

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [feeResponse, studentResponse] = await Promise.all([
        API.get("/fees"),
        API.get("/students"),
      ]);

      const feeData = feeResponse.data;
      const studentData = studentResponse.data;

      setFees(Array.isArray(feeData) ? feeData : feeData.fees || []);
      setStudents(
        Array.isArray(studentData)
          ? studentData
          : studentData.students || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load fees or students. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleFeeChange(event) {
    const { name, value } = event.target;

    setFeeForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleCreateFee(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await API.post("/fees", {
        ...feeForm,
        totalFee: Number(feeForm.totalFee),
      });

      setFeeForm({
        studentId: "",
        billingPeriod: "",
        totalFee: "",
        dueDate: "",
        notes: "",
      });

      setMessage("Fee record created successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create fee record. Check the entered details."
      );
    }
  }

  function handlePaymentChange(feeId, field, value) {
    setPaymentForms((previous) => ({
      ...previous,
      [feeId]: {
        ...previous[feeId],
        [field]: value,
      },
    }));
  }

  async function handleAddPayment(event, fee) {
    event.preventDefault();
    setError("");
    setMessage("");

    const form = paymentForms[fee._id] || {};
    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }

    try {
      await API.post(`/fees/${fee._id}/payments`, {
        amount,
        method: form.method || "UPI",
        reference: form.reference || "",
      });

      setPaymentForms((previous) => ({
        ...previous,
        [fee._id]: { amount: "", method: "UPI", reference: "" },
      }));

      setMessage("Payment recorded successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to record payment. Check the amount and remaining balance."
      );
    }
  }

  async function handleDeleteFee(fee) {
    const confirmed = window.confirm(
      "Delete this fee record? Records with payment history cannot be deleted."
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await API.delete(`/fees/${fee._id}`);
      setMessage("Fee record deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this fee record."
      );
    }
  }

  function formatMoney(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-IN");
  }

  const totalFees = fees.reduce(
    (sum, fee) => sum + Number(fee.totalFee || 0),
    0
  );

  const totalCollected = fees.reduce(
    (sum, fee) => sum + Number(fee.amountPaid || 0),
    0
  );

  const totalBalance = fees.reduce(
    (sum, fee) => sum + Number(fee.balance || 0),
    0
  );

  return (
    <main className="fees-page">
      <style>{`
        .fees-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 18px;
          color: #172033;
          font-family: Arial, sans-serif;
        }
        .fees-page h1 { margin-bottom: 8px; }
        .fees-subtitle { color: #667085; margin-bottom: 24px; }
        .fee-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 26px;
        }
        .fee-stat, .fee-panel, .fee-card {
          background: #fff;
          border: 1px solid #e4e7ec;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 3px 12px #1018280a;
        }
        .fee-stat span { color: #667085; font-size: 14px; }
        .fee-stat h2 { margin: 10px 0 0; font-size: 23px; }
        .fee-panel { margin-bottom: 26px; }
        .fee-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 14px;
          align-items: end;
        }
        .fee-field { display: flex; flex-direction: column; gap: 7px; }
        .fee-field label { font-size: 14px; font-weight: 600; }
        .fee-field input, .fee-field select, .fee-field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px;
          border: 1px solid #d0d5dd;
          border-radius: 7px;
          font: inherit;
          background: #fff;
        }
        .fee-field textarea { resize: vertical; min-height: 40px; }
        .fee-button {
          border: 0;
          border-radius: 7px;
          padding: 11px 15px;
          cursor: pointer;
          font-weight: 600;
          background: #175cd3;
          color: white;
        }
        .fee-button:disabled { opacity: .6; cursor: not-allowed; }
        .fee-button.delete { background: #b42318; }
        .fee-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 16px;
        }
        .fee-card h3 { margin-top: 0; }
        .fee-card p { margin: 9px 0; overflow-wrap: anywhere; }
        .fee-status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          background: #f2f4f7;
        }
        .fee-status.paid { color: #027a48; background: #ecfdf3; }
        .fee-status.pending { color: #b54708; background: #fffaeb; }
        .fee-status.partial { color: #175cd3; background: #eff8ff; }
        .fee-payment {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 14px;
        }
        .fee-payment .fee-field:first-child { grid-column: 1 / -1; }
        .fee-payment button { grid-column: 1 / -1; }
        .fee-history { padding-left: 18px; font-size: 13px; }
        .fee-error, .fee-success {
          padding: 12px;
          border-radius: 8px;
          margin: 14px 0;
        }
        .fee-error { color: #b42318; background: #fef3f2; }
        .fee-success { color: #027a48; background: #ecfdf3; }
        .fee-muted { color: #667085; font-size: 13px; }
        @media (max-width: 480px) {
          .fees-page { padding: 18px 10px; }
          .fee-payment { grid-template-columns: 1fr; }
          .fee-payment .fee-field:first-child,
          .fee-payment button { grid-column: auto; }
        }
      `}</style>

      <h1>Fee Management</h1>
      <p className="fees-subtitle">
        Create hostel fee records, record payments, and track outstanding balances.
      </p>

      {error && <div className="fee-error" role="alert">{error}</div>}
      {message && <div className="fee-success" role="status">{message}</div>}

      <section className="fee-summary">
        <div className="fee-stat">
          <span>Total Fees</span>
          <h2>{formatMoney(totalFees)}</h2>
        </div>
        <div className="fee-stat">
          <span>Total Collected</span>
          <h2>{formatMoney(totalCollected)}</h2>
        </div>
        <div className="fee-stat">
          <span>Outstanding Balance</span>
          <h2>{formatMoney(totalBalance)}</h2>
        </div>
        <div className="fee-stat">
          <span>Fee Records</span>
          <h2>{fees.length}</h2>
        </div>
      </section>

      <section className="fee-panel">
        <h2>Create Fee Record</h2>

        <form className="fee-form" onSubmit={handleCreateFee}>
          <div className="fee-field">
            <label htmlFor="fee-student">Student</label>
            <select
              id="fee-student"
              name="studentId"
              value={feeForm.studentId}
              onChange={handleFeeChange}
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="fee-field">
            <label htmlFor="billingPeriod">Billing Period</label>
            <input
              id="billingPeriod"
              name="billingPeriod"
              placeholder="October 2026"
              value={feeForm.billingPeriod}
              onChange={handleFeeChange}
              required
            />
          </div>

          <div className="fee-field">
            <label htmlFor="totalFee">Total Fee (₹)</label>
            <input
              id="totalFee"
              name="totalFee"
              type="number"
              min="0.01"
              step="0.01"
              value={feeForm.totalFee}
              onChange={handleFeeChange}
              required
            />
          </div>

          <div className="fee-field">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={feeForm.dueDate}
              onChange={handleFeeChange}
              required
            />
          </div>

          <div className="fee-field">
            <label htmlFor="notes">Notes (optional)</label>
            <input
              id="notes"
              name="notes"
              placeholder="Additional details"
              value={feeForm.notes}
              onChange={handleFeeChange}
            />
          </div>

          <button
            className="fee-button"
            type="submit"
            disabled={loading || students.length === 0}
          >
            Create Fee
          </button>
        </form>

        {students.length === 0 && !loading && (
          <p className="fee-muted">
            Add a student in Student Management before creating a fee record.
          </p>
        )}
      </section>

      <section>
        <h2>Student Fee Records</h2>

        {loading ? (
          <p>Loading fee records...</p>
        ) : fees.length === 0 ? (
          <p>No fee records found. Create your first fee record above.</p>
        ) : (
          <div className="fee-list">
            {fees.map((fee) => {
              const student = fee.student || {};
              const balance = Number(fee.balance || 0);
              const status = fee.status || "Pending";
              const statusClass =
                status === "Paid"
                  ? "paid"
                  : status === "Partially Paid"
                    ? "partial"
                    : "pending";

              return (
                <article className="fee-card" key={fee._id}>
                  <h3>{student.name || "Unknown Student"}</h3>
                  <p>
                    <strong>Student ID:</strong>{" "}
                    {student.studentId || "—"}
                  </p>
                  <p>
                    <strong>Room:</strong> {student.roomNumber || "—"}
                  </p>
                  <p>
                    <strong>Billing Period:</strong> {fee.billingPeriod}
                  </p>
                  <p>
                    <strong>Total Fee:</strong> {formatMoney(fee.totalFee)}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> {formatMoney(fee.amountPaid)}
                  </p>
                  <p>
                    <strong>Balance:</strong> {formatMoney(balance)}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {formatDate(fee.dueDate)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`fee-status ${statusClass}`}>
                      {status}
                    </span>
                  </p>

                  {fee.notes && (
                    <p><strong>Notes:</strong> {fee.notes}</p>
                  )}

                  <h4>Payment History</h4>
                  {fee.payments?.length ? (
                    <ul className="fee-history">
                      {fee.payments.map((payment) => (
                        <li key={payment._id}>
                          {formatMoney(payment.amount)} — {payment.method} —{" "}
                          {formatDate(payment.paymentDate)}
                          {payment.reference
                            ? ` — Ref: ${payment.reference}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="fee-muted">No payments recorded yet.</p>
                  )}

                  {balance > 0 && (
                    <form
                      className="fee-payment"
                      onSubmit={(event) => handleAddPayment(event, fee)}
                    >
                      <div className="fee-field">
                        <label>Payment Amount (₹)</label>
                        <input
                          type="number"
                          min="0.01"
                          max={balance}
                          step="0.01"
                          value={paymentForms[fee._id]?.amount || ""}
                          onChange={(event) =>
                            handlePaymentChange(
                              fee._id,
                              "amount",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="fee-field">
                        <label>Payment Method</label>
                        <select
                          value={paymentForms[fee._id]?.method || "UPI"}
                          onChange={(event) =>
                            handlePaymentChange(
                              fee._id,
                              "method",
                              event.target.value
                            )
                          }
                        >
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="fee-field">
                        <label>Reference (optional)</label>
                        <input
                          placeholder="Transaction ID"
                          value={paymentForms[fee._id]?.reference || ""}
                          onChange={(event) =>
                            handlePaymentChange(
                              fee._id,
                              "reference",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <button className="fee-button" type="submit">
                        Record Payment
                      </button>
                    </form>
                  )}

                  {fee.payments?.length === 0 && (
                    <button
                      className="fee-button delete"
                      type="button"
                      style={{ marginTop: 12 }}
                      onClick={() => handleDeleteFee(fee)}
                    >
                      Delete Fee Record
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Fees;