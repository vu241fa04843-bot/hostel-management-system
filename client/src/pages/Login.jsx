import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    setLoading(true);

    try {
      const response = await API.post("/auth/login", formData);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Login successful!");

      if (user.role === "Admin") {
        navigate("/dashboard");
      } else {
        navigate("/student-dashboard");
      }

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Hostel Management</h1>

        <h2 style={styles.heading}>Login</h2>

        <p style={styles.subtitle}>
          Welcome! Please enter your login details.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email Address</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p style={styles.message}>{message}</p>
        )}
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
    fontFamily: "Arial, sans-serif"
  },

  card: {
    width: "350px",
    padding: "30px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },

  title: {
    textAlign: "center",
    color: "#1e3a8a",
    fontSize: "25px"
  },

  heading: {
    textAlign: "center",
    color: "#333"
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "25px"
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "bold"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "18px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box"
  },

  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  },

  message: {
    textAlign: "center",
    marginTop: "15px",
    color: "#2563eb"
  }
};

export default Login;