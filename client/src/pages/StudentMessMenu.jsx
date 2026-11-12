
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
        err.response?.data?.message ||
        "Unable to load mess menu."
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
    <div className="student-mess-page">
      <Link
        to="/student-dashboard"
        className="mess-back-link"
      >
        ← Back to Student Dashboard
      </Link>

      <div className="mess-page-header">
        <h1>Student Mess Menu</h1>
        <p>
          View your daily hostel food menu.
        </p>
      </div>

      {loading && (
        <div className="mess-loading-card">
          Loading menu...
        </div>
      )}

      {error && (
        <div className="mess-error">
          {error}
        </div>
      )}

      {!loading && !error && menus.length === 0 && (
        <div className="mess-empty-card">
          <span>🍽️</span>
          <h3>No Mess Menu Available</h3>
          <p>
            The hostel menu will appear here once it is added.
          </p>
        </div>
      )}

      {!loading && !error && menus.length > 0 && (
        <>
          <div className="mess-summary">
            <div className="mess-summary-card">
              <span>🍽️</span>
              <div>
                <p>Total Menu Records</p>
                <h2>{menus.length}</h2>
              </div>
            </div>

            <div className="mess-summary-card">
              <span>🥗</span>
              <div>
                <p>Meal Categories</p>
                <h2>{meals.length}</h2>
              </div>
            </div>
          </div>

          <section className="mess-menu-section">
            <div className="mess-section-heading">
              <h2>Daily Meal Schedule</h2>
              <span>Hostel Food Menu</span>
            </div>

            <div className="mess-meals-grid">
              {meals.map((meal) => {
                const mealMenus = menus.filter(
                  (menu) => menu.mealType === meal
                );

                return (
                  <article
                    key={meal}
                    className="mess-meal-card"
                  >
                    <div className="mess-meal-heading">
                      <span className="mess-meal-icon">
                        {mealIcons[meal]}
                      </span>
                      <h3>{meal}</h3>
                    </div>

                    {mealMenus.length === 0 ? (
                      <p className="mess-no-meal">
                        No {meal.toLowerCase()} menu available.
                      </p>
                    ) : (
                      <div className="mess-menu-records">
                        {mealMenus.map((menu) => (
                          <div
                            key={menu._id}
                            className="mess-menu-record"
                          >
                            <div className="mess-menu-date">
                              <span>Menu Date</span>
                              <strong>
                                {menu.date
                                  ? new Date(
                                      menu.date
                                    ).toLocaleDateString()
                                  : "Not specified"}
                              </strong>
                            </div>

                            <div className="mess-food-items">
                              <span>Food Items</span>
                              <p>{menu.items}</p>
                            </div>

                            <div className="mess-price">
                              <span>Price</span>
                              <strong>
                                ₹{Number(
                                  menu.price || 0
                                ).toFixed(2)}
                              </strong>
                            </div>

                            {menu.notes && (
                              <div className="mess-notes">
                                <strong>Notes</strong>
                                <p>{menu.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default StudentMessMenu;
