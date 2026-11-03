
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentMessMenu() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await API.get("/mess-menus");

      setMenus(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load mess menu."
      );
    } finally {
      setLoading(false);
    }
  };

  const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];

  const mealIcons = {
    Breakfast: "🌅",
    Lunch: "🍛",
    Snacks: "🥪",
    Dinner: "🌙"
  };

  return (
    <div className="dashboard-main">
      <div style={{ marginBottom: "25px" }}>
        <Link
          to="/student-dashboard"
          style={{
            color: "#38bdf8",
            textDecoration: "none",
            fontSize: "14px"
          }}
        >
          ← Back to Student Dashboard
        </Link>

        <h1 className="dashboard-title" style={{ marginTop: "18px" }}>
          Student Mess Menu
        </h1>

        <p className="dashboard-subtitle">
          View your daily hostel food menu.
        </p>
      </div>

      {loading && (
        <div className="dashboard-card">
          <p style={{ color: "#cbd5e1" }}>Loading menu...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            color: "#fb7185",
            background: "rgba(251, 113, 133, 0.12)"
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && menus.length === 0 && (
        <div className="dashboard-card">
          <p style={{ color: "#94a3b8" }}>
            No mess menus have been added yet.
          </p>
        </div>
      )}

      {!loading && !error && menus.length > 0 && (
        <div className="dashboard-grid">
          {meals.map((meal) => {
            const mealMenus = menus.filter(
              (menu) => menu.mealType === meal
            );

            return (
              <section
                key={meal}
                className="dashboard-card"
                style={{
                  borderTop: "4px solid #38bdf8"
                }}
              >
                <h2
                  style={{
                    color: "#e5e7eb",
                    marginTop: 0
                  }}
                >
                  {mealIcons[meal]} {meal}
                </h2>

                {mealMenus.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>
                    No {meal.toLowerCase()} menu available.
                  </p>
                ) : (
                  mealMenus.map((menu) => (
                    <div
                      key={menu._id}
                      style={{
                        background: "#0f172a",
                        border: "1px solid #26364b",
                        padding: "16px",
                        marginTop: "14px",
                        borderRadius: "10px"
                      }}
                    >
                      <p style={{ color: "#cbd5e1" }}>
                        <strong>Date:</strong>{" "}
                        {menu.date
                          ? new Date(menu.date).toLocaleDateString()
                          : "Not specified"}
                      </p>

                      <p style={{ color: "#cbd5e1" }}>
                        <strong>Food Items:</strong>{" "}
                        {menu.items}
                      </p>

                      <p style={{ color: "#34d399" }}>
                        <strong>Price:</strong> ₹
                        {Number(menu.price || 0).toFixed(2)}
                      </p>

                      {menu.notes && (
                        <p style={{ color: "#94a3b8" }}>
                          <strong>Notes:</strong> {menu.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentMessMenu;
