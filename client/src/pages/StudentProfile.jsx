
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/auth/profile");
        setProfile(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="student-profile-page">
        <p className="profile-status">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-profile-page">
        <p className="profile-error">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="student-profile-page">
        <p className="profile-status">Profile not found.</p>
      </div>
    );
  }

  const profileFields = [
    ["Full Name", profile.name],
    ["Email Address", profile.email],
    ["Registration Number", profile.registrationNumber],
    ["Branch", profile.branch],
    ["Year of Study", profile.yearOfStudy],
    ["Account Role", profile.role],
    [
      "Registered On",
      profile.createdAt
        ? new Date(profile.createdAt).toLocaleDateString()
        : "Not available"
    ]
  ];

  return (
    <main className="student-profile-page">

      <Link
        to="/student-dashboard"
        className="profile-back-link"
      >
        ← Back to Dashboard
      </Link>

      <div className="profile-heading">
        <h1>My Profile</h1>
        <p>View your personal and hostel account information.</p>
      </div>

      <section className="student-profile-card">

        <div className="profile-user-section">
          <div className="profile-avatar">
            {profile.name?.charAt(0).toUpperCase() || "S"}
          </div>

          <h2>{profile.name}</h2>
          <p>Student Account</p>
        </div>

        <div className="profile-divider"></div>

        <div className="profile-details">
          {profileFields.map(([label, value]) => (
            <div className="profile-row" key={label}>
              <strong>{label}</strong>
              <span>{value || "Not available"}</span>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}

export default StudentProfile;
