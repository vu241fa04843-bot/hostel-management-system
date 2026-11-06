
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
  const [loading, setLoading] = useState(false);

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

    if (formData.password.length < 8) {
      setMessage("Password must contain at least 8 characters");
      return;
    }

    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Hostel Management</h1>
        <h2 style={styles.heading}>Student Registration</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            name="registrationNumber"
            placeholder="Registration Number"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            required
            style={styles.input}
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
            style={styles.input}
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
            placeholder="Create Password (minimum 8 characters)"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && (
          <p style={styles.message}>{message}</p>
        )}

        <p style={styles.footer}>
          Already registered? <Link to="/login">Login Here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eef2f7",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    width: "380px",
    maxWidth: "100%",
    padding: "30px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    color: "#1e3a8a"
  },
  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: "25px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "6px"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  message: {
    color: "red",
    textAlign: "center"
  },
  footer: {
    textAlign: "center",
    marginTop: "20px"
  }
};

export default Register;
