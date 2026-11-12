
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentFees() {
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await API.get("/student-fees/my-fees");

        setStudent(response.data.student);
        setFees(response.data.fees || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load fee details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  const totalFee = fees.reduce(
    (sum, fee) => sum + Number(fee.totalFee || 0), 0
  );

  const totalPaid = fees.reduce(
    (sum, fee) => sum + Number(fee.amountPaid || 0), 0
  );

  const totalBalance = fees.reduce(
    (sum, fee) => sum + Number(fee.balance || 0), 0
  );

  const money = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  if (loading) {
    return (
      <main className="student-fees-page">
        <p className="fees-message">Loading fee details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="student-fees-page">
        <p className="fees-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="student-fees-page">

      <Link
        to="/student-dashboard"
        className="fees-back-link"
      >
        ← Back to Dashboard
      </Link>

      <header className="fees-page-header">
        <div>
          <h1>My Fee Details</h1>
          <p>
            View your hostel fee summary and payment history.
          </p>
        </div>
      </header>

      {/* Student Information */}
      {student && (
        <section className="fees-student-card">
          <h2>{student.name}</h2>

          <div className="fees-student-details">
            <p>
              <strong>Student ID:</strong>{" "}
              {student.studentId || "Not available"}
            </p>

            <p>
              <strong>Department:</strong>{" "}
              {student.department || "Not available"}
            </p>

            <p>
              <strong>Year:</strong>{" "}
              {student.year || "Not available"}
            </p>

            <p>
              <strong>Room Number:</strong>{" "}
              {student.roomNumber || "Not assigned"}
            </p>
          </div>
        </section>
      )}

      {/* Fee Summary */}
      <section className="fees-section">
        <h2>Fee Summary</h2>

        <div className="fees-summary-grid">

          <div className="fees-summary-card">
            <span className="fees-summary-icon">💰</span>
            <p>Total Fee</p>
            <h3>{money(totalFee)}</h3>
          </div>

          <div className="fees-summary-card paid">
            <span className="fees-summary-icon">✅</span>
            <p>Amount Paid</p>
            <h3>{money(totalPaid)}</h3>
          </div>

          <div className="fees-summary-card pending">
            <span className="fees-summary-icon">⏳</span>
            <p>Pending Balance</p>
            <h3>{money(totalBalance)}</h3>
          </div>

        </div>
      </section>

      {/* Fee Records */}
      <section className="fees-section">
        <h2>Fee Records</h2>

        {fees.length === 0 ? (
          <div className="fees-empty-card">
            No fee records available.
          </div>
        ) : (
          <div className="fees-table-card">
            <div className="fees-table-wrapper">
              <table className="fees-table">
                <thead>
                  <tr>
                    <th>Billing Period</th>
                    <th>Total Fee</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee._id}>
                      <td>{fee.billingPeriod}</td>
                      <td>{money(fee.totalFee)}</td>
                      <td className="fees-paid-text">
                        {money(fee.amountPaid)}
                      </td>
                      <td className="fees-pending-text">
                        {money(fee.balance)}
                      </td>
                      <td>
                        {fee.dueDate
                          ? new Date(fee.dueDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <span className="fees-status">
                          {fee.status || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Payment History */}
      <section className="fees-section">
        <h2>Payment History</h2>

        {fees.every(
          (fee) => !fee.payments?.length
        ) ? (
          <div className="fees-empty-card">
            No individual payment records available.
          </div>
        ) : (
          <div className="fees-table-card">
            <div className="fees-table-wrapper">
              <table className="fees-table">
                <thead>
                  <tr>
                    <th>Billing Period</th>
                    <th>Payment Date</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Reference</th>
                  </tr>
                </thead>

                <tbody>
                  {fees.flatMap((fee) =>
                    (fee.payments || []).map(
                      (payment, index) => (
                        <tr key={`${fee._id}-${index}`}>
                          <td>{fee.billingPeriod}</td>

                          <td>
                            {payment.paymentDate
                              ? new Date(
                                  payment.paymentDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="fees-paid-text">
                            {money(payment.amount)}
                          </td>

                          <td>{payment.method || "-"}</td>

                          <td>
                            {payment.reference || "-"}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </main>
  );
}

export default StudentFees;
