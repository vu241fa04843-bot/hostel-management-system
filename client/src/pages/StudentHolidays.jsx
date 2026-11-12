
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await API.get("/holidays");
      setHolidays(response.data);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to load holidays."
      );
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date) => {
    if (!date) return false;

    return (
      new Date(date) >=
      new Date(new Date().toDateString())
    );
  };

  if (loading) {
    return (
      <div className="student-holidays-page">
        <p className="holiday-loading">
          Loading holidays...
        </p>
      </div>
    );
  }

  return (
    <div className="student-holidays-page">
      <Link
        to="/student-dashboard"
        className="holiday-back-link"
      >
        ← Back to Student Dashboard
      </Link>

      <div className="holiday-page-header">
        <h1>Hostel Holidays</h1>
        <p>
          View upcoming and previous hostel holidays.
        </p>
      </div>

      {message && (
        <div className="holiday-error">
          {message}
        </div>
      )}

      <div className="holiday-summary">
        <div className="holiday-summary-card">
          <span className="holiday-summary-icon">📅</span>
          <div>
            <p>Total Holidays</p>
            <h2>{holidays.length}</h2>
          </div>
        </div>

        <div className="holiday-summary-card">
          <span className="holiday-summary-icon">🎉</span>
          <div>
            <p>Upcoming Holidays</p>
            <h2>
              {
                holidays.filter((holiday) =>
                  isUpcoming(holiday.startDate)
                ).length
              }
            </h2>
          </div>
        </div>

        <div className="holiday-summary-card">
          <span className="holiday-summary-icon">✓</span>
          <div>
            <p>Completed Holidays</p>
            <h2>
              {
                holidays.filter(
                  (holiday) =>
                    !isUpcoming(holiday.startDate)
                ).length
              }
            </h2>
          </div>
        </div>
      </div>

      <section className="holiday-list-section">
        <div className="holiday-section-heading">
          <h2>Holiday Schedule</h2>
          <span>{holidays.length} Records</span>
        </div>

        {holidays.length === 0 ? (
          <div className="holiday-empty-card">
            <span>📅</span>
            <h3>No Holidays Available</h3>
            <p>
              Hostel holiday announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="holiday-grid">
            {holidays.map((holiday) => {
              const upcoming = isUpcoming(
                holiday.startDate
              );

              return (
                <article
                  key={holiday._id}
                  className="holiday-card"
                >
                  <div className="holiday-card-heading">
                    <div className="holiday-icon">🎊</div>

                    <span
                      className={`holiday-status ${
                        upcoming
                          ? "holiday-upcoming"
                          : "holiday-completed"
                      }`}
                    >
                      {upcoming ? "Upcoming" : "Completed"}
                    </span>
                  </div>

                  <h3>
                    {holiday.holidayName || holiday.name}
                  </h3>

                  <div className="holiday-description">
                    <strong>Description</strong>
                    <p>
                      {holiday.description ||
                        "No description available"}
                    </p>
                  </div>

                  <div className="holiday-dates">
                    <div>
                      <span>Start Date</span>
                      <strong>
                        {holiday.startDate
                          ? new Date(
                              holiday.startDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>End Date</span>
                      <strong>
                        {holiday.endDate
                          ? new Date(
                              holiday.endDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentHolidays;
