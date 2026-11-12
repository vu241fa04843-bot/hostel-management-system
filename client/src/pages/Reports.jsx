
import { useState } from "react";
import API from "../services/api";

export default function Reports() {
  const [reportType, setReportType] = useState("students");
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    return columns[reportType] || [];
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await API.get(
        `/reports/${reportType}`
      );

      setRecords(response.data);
      setMessage("Report loaded successfully!");
    } catch (err) {
      setRecords([]);
      setError(
        err.response?.data?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (record) => {
    if (
      record.student &&
      typeof record.student === "object"
    ) {
      return record.student.name || "Unknown";
    }

    return record.name || "Unknown";
  };

  const getValue = (record, column) => {
    if (column === "student") {
      return getStudentName(record);
    }

    const value = record[column];

    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (
      [
        "date",
        "createdAt",
        "outingDate",
        "returnDate",
      ].includes(column)
    ) {
      const parsedDate = new Date(value);

      return Number.isNaN(parsedDate.getTime())
        ? "-"
        : parsedDate.toLocaleString();
    }

    if (typeof value === "object") {
      return value.name || "-";
    }

    return String(value);
  };

  const formatColumnName = (column) => {
    return column
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase());
  };

  const downloadCSV = () => {
    if (!records.length) {
      setError("Load a report before downloading.");
      setMessage("");
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

    setMessage("CSV report downloaded successfully!");
    setError("");
  };

  const handleReportChange = (e) => {
    setReportType(e.target.value);
    setRecords([]);
    setMessage("");
    setError("");
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports Management</h1>
          <p>
            View and download hostel management reports.
          </p>
        </div>
      </div>

      {message && (
        <div className="reports-alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="reports-alert error">
          {error}
        </div>
      )}

      <section className="reports-filter-section">
        <div className="reports-section-heading">
          <h2>Generate Report</h2>
          <p>Select a report type to view its records.</p>
        </div>

        <div className="reports-controls">
          <div className="reports-field">
            <label htmlFor="report-type">
              Select Report Type
            </label>

            <select
              id="report-type"
              value={reportType}
              onChange={handleReportChange}
            >
              <option value="students">Student Report</option>
              <option value="fees">Fee Report</option>
              <option value="attendance">
                Attendance Report
              </option>
              <option value="complaints">
                Complaint Report
              </option>
              <option value="outings">Outing Report</option>
            </select>
          </div>

          <div className="reports-buttons">
            <button
              type="button"
              className="reports-generate"
              onClick={loadReport}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>

            <button
              type="button"
              className="reports-download"
              onClick={downloadCSV}
              disabled={loading || records.length === 0}
            >
              Download CSV
            </button>
          </div>
        </div>
      </section>

      <section className="reports-results-section">
        <div className="reports-results-header">
          <div>
            <h2>Report Results</h2>
            <p>
              Showing {reportType} report records.
            </p>
          </div>

          <div className="reports-total">
            <span>Total Records</span>
            <strong>{records.length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="reports-empty">
            Generating report...
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  {getColumns().map((column) => (
                    <th key={column}>
                      {formatColumnName(column)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={getColumns().length || 1}
                      className="reports-empty"
                    >
                      No records to display. Generate a report.
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr key={record._id || index}>
                      {getColumns().map((column) => (
                        <td key={column}>
                          {getValue(record, column)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
