
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
        setFees(response.data.fees);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load fee details");
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

  const tableStyle = {
    width: "100%",
    minWidth: "650px",
    borderCollapse: "collapse",
    textAlign: "center",
    color: "#e5e7eb"
  };

  const cellStyle = {
    padding: "14px",
    borderBottom: "1px solid #334155"
  };

  if (loading) {
    return <main className="dashboard-main">Loading fee details...</main>;
  }

  if (error) {
    return (
      <main className="dashboard-main">
        <p className="dashboard-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="dashboard-main" style={{ minHeight: "100vh" }}>
      <Link
        to="/student-dashboard"
        style={{ color: "#38bdf8", textDecoration: "none" }}
      >
        ← Back to Dashboard
      </Link>

      <header className="dashboard-topbar" style={{ marginTop: "22px" }}>
        <div>
          <h1 className="dashboard-title">My Fee Details</h1>
          <p className="dashboard-subtitle">
            View your hostel fee summary and payment history.
          </p>
        </div>
      </header>

      {student && (
        <section className="dashboard-card">
          <h2 style={{ color: "#f8fafc" }}>{student.name}</h2>
          <p>Student ID: {student.studentId || "Not available"}</p>
          <p>Department: {student.department || "Not available"}</p>
          <p>Year: {student.year || "Not available"}</p>
          <p>Room Number: {student.roomNumber || "Not assigned"}</p>
        </section>
      )}

      <section className="dashboard-section">
        <h2>Fee Summary</h2>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <p className="dashboard-card-label">Total Fee</p>
            <h2 className="dashboard-card-value">{money(totalFee)}</h2>
          </div>

          <div className="dashboard-card">
            <p className="dashboard-card-label">Amount Paid</p>
            <h2 className="dashboard-card-value" style={{ color: "#34d399" }}>
              {money(totalPaid)}
            </h2>
          </div>

          <div className="dashboard-card">
            <p className="dashboard-card-label">Pending Balance</p>
            <h2 className="dashboard-card-value" style={{ color: "#fb7185" }}>
              {money(totalBalance)}
            </h2>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Fee Records</h2>

        {fees.length === 0 ? (
          <div className="dashboard-card">No fee records available.</div>
        ) : (
          <div className="dashboard-card" style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {["Billing Period", "Total Fee", "Paid", "Balance", "Due Date", "Status"].map(item => (
                    <th key={item} style={cellStyle}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => (
                  <tr key={fee._id}>
                    <td style={cellStyle}>{fee.billingPeriod}</td>
                    <td style={cellStyle}>{money(fee.totalFee)}</td>
                    <td style={{ ...cellStyle, color: "#34d399" }}>{money(fee.amountPaid)}</td>
                    <td style={{ ...cellStyle, color: "#fb7185" }}>{money(fee.balance)}</td>
                    <td style={cellStyle}>
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td style={cellStyle}>{fee.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Payment History</h2>

        {fees.every(fee => !fee.payments?.length) ? (
          <div className="dashboard-card">
            No individual payment records available.
          </div>
        ) : (
          <div className="dashboard-card" style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {["Billing Period", "Payment Date", "Amount", "Payment Method", "Reference"].map(item => (
                    <th key={item} style={cellStyle}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.flatMap(fee =>
                  (fee.payments || []).map((payment, index) => (
                    <tr key={`${fee._id}-${index}`}>
                      <td style={cellStyle}>{fee.billingPeriod}</td>
                      <td style={cellStyle}>
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={cellStyle}>{money(payment.amount)}</td>
                      <td style={cellStyle}>{payment.method || "-"}</td>
                      <td style={cellStyle}>{payment.reference || "-"}</td>
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

export default StudentFees;
