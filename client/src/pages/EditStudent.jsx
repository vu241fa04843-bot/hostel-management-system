import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    gender: "",
    roomNumber: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await API.get(`/students/${id}`);
        const student = response.data;

        setFormData({
          name: student.name || "",
          studentId: student.studentId || "",
          email: student.email || "",
          phone: student.phone || "",
          department: student.department || "",
          year: student.year || "",
          gender: student.gender || "",
          roomNumber: student.roomNumber || "",
          guardianName: student.guardianName || "",
          guardianPhone: student.guardianPhone || "",
          address: student.address || "",
        });
      } catch (error) {
        console.error("Error loading student:", error);
        alert("Unable to load student details.");
        navigate("/students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, navigate]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await API.put(`/students/${id}`, formData);
      alert("Student updated successfully!");
      navigate("/students");
    } catch (error) {
      console.error("Error updating student:", error);
      alert(
        error.response?.data?.message ||
          "Failed to update student. Please check the details."
      );
    }
  };

  if (loading) {
    return <div className="page"><h2>Loading student...</h2></div>;
  }

  return (
    <div className="page">
      <h1>Edit Student</h1>
      <p>Update the student information below.</p>

      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "15px" }}>
            <label
              htmlFor={key}
              style={{
                display: "block",
                marginBottom: "5px",
                textTransform: "capitalize",
              }}
            >
              {key.replace(/([A-Z])/g, " $1")}
            </label>

            {key === "address" ? (
              <textarea
                id={key}
                name={key}
                value={value}
                onChange={handleChange}
                rows="3"
                style={{ width: "100%", padding: "10px" }}
              />
            ) : key === "gender" ? (
              <select
                id={key}
                name={key}
                value={value}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px" }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <input
                id={key}
                name={key}
                type={key === "email" ? "email" : "text"}
                value={value}
                onChange={handleChange}
                required={["name", "studentId", "email"].includes(key)}
                style={{ width: "100%", padding: "10px" }}
              />
            )}
          </div>
        ))}

        <button type="submit">Save Changes</button>{" "}
        <button
          type="button"
          onClick={() => navigate("/students")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditStudent;
