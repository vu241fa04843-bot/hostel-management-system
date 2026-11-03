import { useState } from "react";
import API from "../services/api";

export default function Reports() {
  const [reportType, setReportType] = useState("students");
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      const response = await API.get(
        `/reports/${reportType}`
      );

      setRecords(response.data);
      setMessage("Report loaded successfully!");
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load report."
      );
      setMessage("");
    }
  };

  const getStudentName = (record) => {
    if (record.student && typeof record.student === "object") {
      return record.student.name || "Unknown";
    }

    return record.name || "Unknown";
  };

  const getColumns = () => {
    const columns = {
      students: [
        "name",
        "studentId",
        "email",
        "roomNumber",
      ],
      fees: [
        "student",
        "amount",
        "status",
        "createdAt",
      ],
      attendance: [
        "student",
        "date",
        "status",
        "remarks",
      ],
      complaints: [
        "student",
        "title",
        "status",
        "createdAt",
      ],
      outings: [
        "student",
        "destination",
        "outingDate",
        "returnDate",
        "status",
      ],
    };

    return columns[reportType];
  };

  const getValue = (record, column) => {
    if (column === "student") {
      return getStudentName(record);
    }

    const value = record[column];

    if (value === null || value === undefined) {
      return "-";
    }

    if (
      ["date", "createdAt", "outingDate", "returnDate"].includes(
        column
      )
    ) {
      return new Date(value).toLocaleString();
    }

    if (typeof value === "object") {
      return value.name || "-";
    }

    return String(value);
  };

  const downloadCSV = () => {
    if (!records.length) {
      setError("Load a report before downloading.");
      return;
    }

    const columns = getColumns();

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = [
      columns.map(escapeCSV).join(","),
      ...records.map((record) =>
        columns
          .map((column) =>
            escapeCSV(getValue(record, column))
          )
          .join(",")
      ),
    ];

    const csvContent = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${reportType}-report.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <h1>Reports Management</h1>

      <p>View and download hostel management reports.</p>

      <div style={styles.form}>
        <label>Select Report Type</label>

        <select
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            setRecords([]);
            setMessage("");
            setError("");
          }}
          style={styles.input}
        >
          <option value="students">Student Report</option>
          <option value="fees">Fee Report</option>
          <option value="attendance">Attendance Report</option>
          <option value="complaints">Complaint Report</option>
          <option value="outings">Outing Report</option>
        </select>

        <button
          onClick={loadReport}
          style={styles.loadButton}
        >
          Generate Report
        </button>

        <button
          onClick={downloadCSV}
          style={styles.downloadButton}
        >
          Download CSV
        </button>
      </div>

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <h2>Report Results</h2>

      <p>Total Records: {records.length}</p>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {records.length > 0 &&
                getColumns().map((column) => (
                  <th key={column}>
                    {column.toUpperCase()}
                  </th>
                ))}
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record._id}>
                {getColumns().map((column) => (
                  <td key={column}>
                    {getValue(record, column)}
                  </td>
                ))}
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td>
                  No records to display. Generate a report.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "25px",
    fontFamily: "Arial, sans-serif",
  },

  form: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    maxWidth: "550px",
    marginBottom: "25px",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "10px 0 15px",
  },

  loadButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    marginRight: "10px",
    cursor: "pointer",
  },

  downloadButton: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "10px 18px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
};