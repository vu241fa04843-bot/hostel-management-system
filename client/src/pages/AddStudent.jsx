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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/students", formData);

      alert("Student added successfully!");

      navigate("/students");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to add student"
      );
    }
  };

  return (
    <div className="page">
      <h1>Add Student</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={formData.studentId}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="year"
          placeholder="Year"
          value={formData.year}
          onChange={handleChange}
          required
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          name="roomNumber"
          placeholder="Room Number"
          value={formData.roomNumber}
          onChange={handleChange}
        />

        <input
          type="text"
          name="guardianName"
          placeholder="Guardian Name"
          value={formData.guardianName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="guardianPhone"
          placeholder="Guardian Phone"
          value={formData.guardianPhone}
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

        <button type="submit">
          Add Student
        </button>

      </form>
    </div>
  );
}

export default AddStudent;