
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    branch: "",
    yearOfStudy: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        registrationNumber: formData.registrationNumber,
        branch: formData.branch,
        yearOfStudy: formData.yearOfStudy,
        password: formData.password
      });

      alert("Registration successful! Please login.");
      navigate("/login");

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#eef2f7",
      padding: "20px"
    }}>
      <div style={{
        width: "380px",
        padding: "30px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center" }}>
          Student Registration
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            name="registrationNumber"
            placeholder="Enter registration number"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="IT">IT</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Select Year of Study</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Create password (minimum 8 characters)"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            Register
          </button>
        </form>

        {message && (
          <p style={{ color: "red", textAlign: "center" }}>
            {message}
          </p>
        )}

        <p style={{ textAlign: "center" }}>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default Register;
