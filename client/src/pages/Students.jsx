
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch students from MongoDB
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

  // Delete student
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/students/${id}`);

      setStudents((currentStudents) =>
        currentStudents.filter(
          (student) => student._id !== id
        )
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

  if (loading) {
    return (
      <div className="page">
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Student Management</h1>

      <p>Total Students: {students.length}</p>

      <button
        type="button"
        onClick={() => navigate("/add-student")}
        style={{
          backgroundColor: "#059669",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        + Add Student
      </button>
      <button
  type="button"
  onClick={() => navigate("/rooms")}
  style={{
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px"
  }}
>
  Manage Rooms
</button>

      {students.length === 0 ? (
        <p>No students found. Please add a student first.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left"
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Student ID</th>
                <th style={{ padding: "10px" }}>Email</th>
                <th style={{ padding: "10px" }}>Department</th>
                <th style={{ padding: "10px" }}>Year</th>
                <th style={{ padding: "10px" }}>Room</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td style={{ padding: "10px" }}>
                    {student.name}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {student.studentId}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {student.email}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {student.department || "-"}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {student.year || "-"}
                  </td>

                  <td style={{ padding: "10px" }}>
                    {student.roomNumber || "Not assigned"}
                  </td>

                  <td style={{ padding: "10px" }}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/edit-student/${student._id}`
                        )
                      }
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "8px"
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          student._id,
                          student.name
                        )
                      }
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Students;