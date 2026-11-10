
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/students.css";

function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    try {
      const response = await API.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/students/${id}`);

      setStudents((currentStudents) =>
        currentStudents.filter((student) => student._id !== id)
      );

      alert("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete student."
      );
    }
  };

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return students;

    return students.filter((student) =>
      [
        student.name,
        student.studentId,
        student.email,
        student.department,
        student.roomNumber
      ].some((field) =>
        String(field || "").toLowerCase().includes(value)
      )
    );
  }, [students, search]);

  if (loading) {
    return (
      <div className="students-page">
        <div className="students-loading">
          <div className="loading-spinner"></div>
          <p>Loading student records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="students-page">

      <div className="students-header">
        <div>
          <span className="students-eyebrow">
            HOSTEL ADMINISTRATION
          </span>
          <h1>Student Management</h1>
          <p>Manage student records, details and room assignments.</p>
        </div>

        <button
          className="add-student-btn"
          type="button"
          onClick={() => navigate("/add-student")}
        >
          <span>＋</span> Add Student
        </button>
      </div>

      <div className="students-stats">
        <div className="student-stat-card">
          <div className="stat-icon total-icon">👥</div>
          <div>
            <p>Total Students</p>
            <h2>{students.length}</h2>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="stat-icon assigned-icon">🏠</div>
          <div>
            <p>Room Assigned</p>
            <h2>
              {students.filter((student) => student.roomNumber).length}
            </h2>
          </div>
        </div>

        <div className="student-stat-card">
          <div className="stat-icon unassigned-icon">📋</div>
          <div>
            <p>Room Not Assigned</p>
            <h2>
              {students.filter((student) => !student.roomNumber).length}
            </h2>
          </div>
        </div>
      </div>

      <div className="students-content">

        <div className="students-toolbar">
          <div>
            <h2>All Students</h2>
            <p>View and manage registered students.</p>
          </div>

          <button
            className="manage-rooms-btn"
            type="button"
            onClick={() => navigate("/rooms")}
          >
            🏠 Manage Rooms
          </button>
        </div>

        <div className="students-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search by name, student ID, email or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="students-empty">
            <div>👨‍🎓</div>
            <h3>
              {students.length === 0
                ? "No students found"
                : "No matching students"}
            </h3>
            <p>
              {students.length === 0
                ? "Start by adding your first student."
                : "Try searching with a different name or student ID."}
            </p>

            {students.length === 0 && (
              <button
                className="add-student-btn"
                onClick={() => navigate("/add-student")}
                type="button"
              >
                + Add Student
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="students-results">
              Showing <strong>{filteredStudents.length}</strong> of{" "}
              <strong>{students.length}</strong> students
            </div>

            <div className="students-table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Year</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <div className="student-name-cell">
                          <div className="student-avatar">
                            {student.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <strong>{student.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="student-id">
                          {student.studentId || "-"}
                        </span>
                      </td>

                      <td>{student.email}</td>

                      <td>{student.department || "-"}</td>

                      <td>
                        <span className="year-badge">
                          {student.year || "-"}
                        </span>
                      </td>

                      <td>
                        {student.roomNumber ? (
                          <span className="room-badge">
                            {student.roomNumber}
                          </span>
                        ) : (
                          <span className="unassigned-badge">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="student-actions">
                          <button
                            className="edit-student-btn"
                            type="button"
                            onClick={() =>
                              navigate(`/edit-student/${student._id}`)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-student-btn"
                            type="button"
                            onClick={() =>
                              handleDelete(student._id, student.name)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Students;
