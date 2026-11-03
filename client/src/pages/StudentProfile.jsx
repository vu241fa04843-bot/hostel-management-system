
import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

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

  if (loading) return <h2 style={{ color: "#f8fafc" }}>Loading profile...</h2>;
  if (error) return <h2 style={{ color: "#fb7185" }}>{error}</h2>;
  if (!profile) return <h2 style={{ color: "#f8fafc" }}>Profile not found</h2>;

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
    <div className="dashboard-main" style={{ minHeight: "100vh" }}>
      <Link
        to="/student-dashboard"
        style={{
          color: "#38bdf8",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        ← Back to Dashboard
      </Link>

      <h1 className="dashboard-title" style={{ marginTop: "25px" }}>
        Student Profile
      </h1>

      <div
        className="dashboard-card"
        style={{
          maxWidth: "650px",
          marginTop: "25px",
          color: "#e5e7eb"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "75px",
              height: "75px",
              margin: "0 auto 15px",
              borderRadius: "50%",
              background: "#26364b",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "bold"
            }}
          >
            {profile.name?.charAt(0).toUpperCase()}
          </div>

          <h2 style={{ color: "#f8fafc" }}>{profile.name}</h2>
          <p style={{ color: "#94a3b8" }}>Student Account</p>
        </div>

        <hr style={{ borderColor: "#334155", margin: "22px 0" }} />

        {profileFields.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              flexWrap: "wrap",
              padding: "13px 5px",
              borderBottom: "1px solid #26364b"
            }}
          >
            <strong style={{ color: "#94a3b8" }}>{label}</strong>
            <span style={{ color: "#f1f5f9", textAlign: "right" }}>
              {value || "Not available"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentProfile;
