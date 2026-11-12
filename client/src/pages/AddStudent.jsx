
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AddStudent() {
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
    address: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await API.post("/students", formData);

      setMessage("Student added successfully!");

      setTimeout(() => {
        navigate("/students");
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Failed to add student. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/students");
  };

  return (
    <div className="add-student-page">
      <div className="add-student-header">
        <div>
          <p className="add-student-breadcrumb">Admin / Students</p>
          <h1>Add New Student</h1>
          <p className="add-student-subtitle">
            Enter the student's details to create a new hostel record.
          </p>
        </div>

        <button
          type="button"
          className="add-student-back-btn"
          onClick={handleCancel}
        >
          ← Back to Students
        </button>
      </div>

      <form className="add-student-form" onSubmit={handleSubmit}>
        {message && (
          <div className="add-student-message success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="add-student-message error-message">
            {error}
          </div>
        )}

        {/* Personal Information */}
        <section className="add-student-section">
          <div className="add-student-section-heading">
            <div className="add-student-section-icon">👤</div>
            <div>
              <h2>Personal Information</h2>
              <p>Enter the student's basic contact details.</p>
            </div>
          </div>

          <div className="add-student-grid">
            <div className="add-student-field">
              <label htmlFor="name">Student Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter student name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-student-field">
              <label htmlFor="studentId">Student ID *</label>
              <input
                id="studentId"
                type="text"
                name="studentId"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-student-field">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-student-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="add-student-field">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="add-student-field add-student-full-width">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="add-student-section">
          <div className="add-student-section-heading">
            <div className="add-student-section-icon">🎓</div>
            <div>
              <h2>Academic Information</h2>
              <p>Enter the student's course and year details.</p>
            </div>
          </div>

          <div className="add-student-grid">
            <div className="add-student-field">
              <label htmlFor="department">Department *</label>
              <input
                id="department"
                type="text"
                name="department"
                placeholder="Example: Computer Science"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-student-field">
              <label htmlFor="year">Year of Study *</label>
              <input
                id="year"
                type="number"
                name="year"
                placeholder="Enter year"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Room Information */}
        <section className="add-student-section">
          <div className="add-student-section-heading">
            <div className="add-student-section-icon">🏠</div>
            <div>
              <h2>Room Information</h2>
              <p>Add the student's hostel room details.</p>
            </div>
          </div>

          <div className="add-student-grid">
            <div className="add-student-field">
              <label htmlFor="roomNumber">Room Number</label>
              <input
                id="roomNumber"
                type="text"
                name="roomNumber"
                placeholder="Enter room number"
                value={formData.roomNumber}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Guardian Information */}
        <section className="add-student-section">
          <div className="add-student-section-heading">
            <div className="add-student-section-icon">👨‍👩‍👧</div>
            <div>
              <h2>Guardian Information</h2>
              <p>Enter the parent or guardian's contact details.</p>
            </div>
          </div>

          <div className="add-student-grid">
            <div className="add-student-field">
              <label htmlFor="guardianName">Guardian Name</label>
              <input
                id="guardianName"
                type="text"
                name="guardianName"
                placeholder="Enter guardian name"
                value={formData.guardianName}
                onChange={handleChange}
              />
            </div>

            <div className="add-student-field">
              <label htmlFor="guardianPhone">Guardian Phone</label>
              <input
                id="guardianPhone"
                type="tel"
                name="guardianPhone"
                placeholder="Enter guardian phone"
                value={formData.guardianPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <div className="add-student-actions">
          <button
            type="button"
            className="add-student-cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="add-student-submit-btn"
            disabled={loading}
          >
            {loading ? "Adding Student..." : "＋ Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStudent;
