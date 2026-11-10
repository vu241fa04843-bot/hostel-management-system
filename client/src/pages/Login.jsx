
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.email.trim() || !formData.password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        setMessage("Invalid server response. Please try again.");
        return;
      }

      // Preserve existing authentication storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      if (user.role === "Admin") {
        navigate("/dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left visual panel */}
      <section className="login-visual">
        <div className="login-brand">
          <span className="brand-icon">H</span>
          <span>HOSTELHUB</span>
        </div>

        <div className="visual-content">
          <span className="visual-tag">
            YOUR CAMPUS, YOUR COMMUNITY
          </span>

          <h1>
            A smarter way
            <br />
            to manage hostel life.
          </h1>

          <p>
            Manage student records, rooms, fees, attendance
            and everyday hostel activities from one platform.
          </p>

          <div className="visual-features">
            <div>✓ Easy hostel management</div>
            <div>✓ Student-friendly services</div>
            <div>✓ Organized administration</div>
          </div>
        </div>

        <div className="visual-footer">
          HOSTEL MANAGEMENT SYSTEM
        </div>
      </section>

      {/* Right login panel */}
      <section className="login-form-section">
        <div className="login-card">

          <div className="login-mobile-brand">
            <span className="brand-icon">H</span>
            HOSTELHUB
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <div className="login-input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="login-input-wrap">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <span className="forgot-password">
                Forgot password?
              </span>
            </div>

            {message && (
              <div className="login-error" role="alert">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <span>→</span>}
            </button>

          </form>

          <div className="login-register">
            Don't have an account?
            <Link to="/register"> Create account</Link>
          </div>

          <div className="login-security">
            <span>🔐</span>
            Your account information is protected.
          </div>

        </div>

        <footer className="login-page-footer">
          © {new Date().getFullYear()} HOSTELHUB · Hostel Management System
        </footer>
      </section>
    </div>
  );
}
