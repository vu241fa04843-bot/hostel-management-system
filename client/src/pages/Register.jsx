
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registrationNumber: "",
    branch: "",
    yearOfStudy: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setSuccess(false);
  };

  const passwordStrength = () => {
    const password = formData.password;

    if (!password) return 0;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (formData.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        branch: formData.branch,
        yearOfStudy: formData.yearOfStudy,
        password: formData.password,
      });

      setSuccess(true);
      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* Left visual section */}
      <section className="register-visual">
        <div className="register-brand">
          <span className="brand-icon">H</span>
          <span>HOSTELHUB</span>
        </div>

        <div className="register-visual-content">
          <span className="register-tag">
            JOIN OUR CAMPUS COMMUNITY
          </span>

          <h1>
            Your hostel journey
            <br />
            starts here.
          </h1>

          <p>
            Create your student account to access hostel
            services, check fee details, view attendance
            and manage your daily activities.
          </p>

          <div className="register-benefits">
            <div>✓ Access your student dashboard</div>
            <div>✓ View hostel fee information</div>
            <div>✓ Submit complaints and outing requests</div>
            <div>✓ Stay updated with hostel activities</div>
          </div>
        </div>

        <div className="register-visual-footer">
          HOSTEL MANAGEMENT SYSTEM
        </div>
      </section>

      {/* Registration form */}
      <section className="register-form-section">
        <div className="register-card">

          <div className="register-mobile-brand">
            <span className="brand-icon">H</span>
            HOSTELHUB
          </div>

          <div className="register-heading">
            <span className="register-eyebrow">
              STUDENT ACCOUNT
            </span>

            <h2>Create your account</h2>

            <p>
              Enter your details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="register-form-grid">

              <div className="register-field">
                <label htmlFor="name">Full Name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="registrationNumber">
                  Registration Number
                </label>

                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  placeholder="Enter registration number"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="branch">Department / Branch</label>

                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
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
              </div>

              <div className="register-field full-width">
                <label htmlFor="yearOfStudy">Year of Study</label>

                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Year of Study</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="register-field">
                <label htmlFor="password">Create Password</label>

                <div className="register-password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-track">
                      <div
                        className={`strength-fill strength-${strength}`}
                      />
                    </div>

                    <small>
                      Password strength: {
                        strength <= 2 ? "Weak" :
                        strength <= 4 ? "Good" : "Strong"
                      }
                    </small>
                  </div>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="register-password-wrap">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

            </div>

            {message && (
              <div
                className={`register-message ${
                  success ? "register-success" : "register-error"
                }`}
                role="alert"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <span>→</span>}
            </button>

          </form>

          <div className="register-login-link">
            Already have an account?
            <Link to="/login"> Sign In</Link>
          </div>

          <div className="register-security">
            🔐 Your account information is protected.
          </div>

        </div>

        <footer className="register-page-footer">
          © {new Date().getFullYear()} HOSTELHUB · Hostel Management System
        </footer>
      </section>

    </div>
  );
}

export default Register;
