
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
      <header className="fees-header">
        <div>
          <p className="fees-eyebrow">ADMINISTRATION</p>
          <h1>Fee Management</h1>
          <p className="fees-subtitle">
            Create hostel fee records, record payments, and track outstanding
            balances.
          </p>
        </div>
      </header>

      {error && (
        <div className="fee-alert fee-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="fee-alert fee-success" role="status">
          {message}
        </div>
      )}

      <section className="fee-summary">
        <article className="fee-stat">
          <span>Total Fees</span>
          <h2>{formatMoney(totalFees)}</h2>
        </article>

        <article className="fee-stat">
          <span>Total Collected</span>
          <h2>{formatMoney(totalCollected)}</h2>
        </article>

        <article className="fee-stat">
          <span>Outstanding Balance</span>
          <h2>{formatMoney(totalBalance)}</h2>
        </article>

        <article className="fee-stat">
          <span>Fee Records</span>
          <h2>{fees.length}</h2>
        </article>
      </section>

      <section className="fee-panel">
        <div className="fee-section-heading">
          <div>
            <h2>Create Fee Record</h2>
            <p>Add a new fee entry for a hostel student.</p>
          </div>
        </div>

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

      <section className="fee-records-section">
        <div className="fee-section-heading">
          <div>
            <h2>Student Fee Records</h2>
            <p>View balances, payment history, and record new payments.</p>
          </div>
          <span className="fee-record-count">{fees.length} records</span>
        </div>

        {loading ? (
          <div className="fee-empty-state">Loading fee records...</div>
        ) : fees.length === 0 ? (
          <div className="fee-empty-state">
            No fee records found. Create your first fee record above.
          </div>
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
                  <div className="fee-card-header">
                    <div>
                      <p className="fee-card-label">STUDENT</p>
                      <h3>{student.name || "Unknown Student"}</h3>
                      <p className="fee-student-id">
                        ID: {student.studentId || "—"}
                      </p>
                    </div>

                    <span className={`fee-status ${statusClass}`}>
                      {status}
                    </span>
                  </div>

                  <div className="fee-details-grid">
                    <div>
                      <span>Room</span>
                      <strong>{student.roomNumber || "—"}</strong>
                    </div>
                    <div>
                      <span>Billing Period</span>
                      <strong>{fee.billingPeriod || "—"}</strong>
                    </div>
                    <div>
                      <span>Total Fee</span>
                      <strong>{formatMoney(fee.totalFee)}</strong>
                    </div>
                    <div>
                      <span>Amount Paid</span>
                      <strong>{formatMoney(fee.amountPaid)}</strong>
                    </div>
                    <div>
                      <span>Balance</span>
                      <strong className="fee-balance">
                        {formatMoney(balance)}
                      </strong>
                    </div>
                    <div>
                      <span>Due Date</span>
                      <strong>{formatDate(fee.dueDate)}</strong>
                    </div>
                  </div>

                  {fee.notes && (
                    <p className="fee-notes">
                      <strong>Notes:</strong> {fee.notes}
                    </p>
                  )}

                  <div className="fee-history-section">
                    <h4>Payment History</h4>

                    {fee.payments?.length ? (
                      <ul className="fee-history">
                        {fee.payments.map((payment) => (
                          <li key={payment._id}>
                            <strong>{formatMoney(payment.amount)}</strong>
                            <span>{payment.method}</span>
                            <span>{formatDate(payment.paymentDate)}</span>
                            {payment.reference && (
                              <span>Ref: {payment.reference}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="fee-muted">
                        No payments recorded yet.
                      </p>
                    )}
                  </div>

                  {balance > 0 && (
                    <form
                      className="fee-payment"
                      onSubmit={(event) => handleAddPayment(event, fee)}
                    >
                      <h4>Record a Payment</h4>

                      <div className="fee-payment-fields">
                        <div className="fee-field">
                          <label htmlFor={`amount-${fee._id}`}>
                            Payment Amount (₹)
                          </label>
                          <input
                            id={`amount-${fee._id}`}
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
                          <label htmlFor={`method-${fee._id}`}>
                            Payment Method
                          </label>
                          <select
                            id={`method-${fee._id}`}
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
                          <label htmlFor={`reference-${fee._id}`}>
                            Reference (optional)
                          </label>
                          <input
                            id={`reference-${fee._id}`}
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
