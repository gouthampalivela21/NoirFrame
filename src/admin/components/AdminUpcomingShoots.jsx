import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext.jsx";

export default function AdminUpcomingShoots() {
  const { bookings } = useAdmin();
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Only display real upcoming shoots from database
  const activeBookings = Array.isArray(bookings)
    ? bookings.filter((b) => b.status !== "Cancelled")
    : [];
  const displayShoots = activeBookings.slice(0, 3);

  // Generate 7-day display centered around selected day or today
  const daysRow = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentYear, currentMonthIndex, today.getDate() - 3 + i);
    const dayNum = d.getDate();
    const isOtherMonth = d.getMonth() !== currentMonthIndex;
    const hasShoot = activeBookings.some((b) => {
      if (!b.date) return false;
      const bDate = new Date(b.date);
      return bDate.getDate() === dayNum && bDate.getMonth() === d.getMonth();
    });
    return { day: dayNum, isOtherMonth, hasShoot };
  });

  return (
    <div className="admin-section-block">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Upcoming Shoots</h2>
        <Link to="/admin/bookings" className="admin-calendar-link">
          <span>View Calendar</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Mini Calendar Widget */}
      <div className="admin-mini-calendar">
        <div className="admin-calendar-header">
          <span className="admin-calendar-month">
            {monthNames[currentMonthIndex]} {currentYear}
          </span>
          <div className="admin-calendar-arrows">
            <button
              type="button"
              className="admin-cal-arrow-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              &lt;
            </button>
            <button
              type="button"
              className="admin-cal-arrow-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="admin-calendar-grid-header">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Calendar days row matching screenshot */}
        <div className="admin-calendar-days-row">
          {daysRow.map((cell, idx) => {
            const isSelected = selectedDay === cell.day;
            return (
              <div
                key={idx}
                className={`admin-cal-day-cell ${isSelected ? "is-selected" : ""} ${cell.hasShoot ? "has-shoot" : ""}`}
                style={{
                  opacity: cell.isOtherMonth && !isSelected ? 0.45 : 1,
                }}
                onClick={() => setSelectedDay(cell.day)}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Shoots List */}
      <div className="admin-shoots-list">
        {displayShoots.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              background: "#FFFFFF",
              borderRadius: "10px",
              border: "1px dashed var(--admin-border)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13.5px",
                fontWeight: 600,
                color: "var(--admin-text-primary)",
              }}
            >
              No shoots scheduled
            </p>
            <p
              style={{
                margin: "4px 0 14px",
                fontSize: "12px",
                color: "var(--admin-text-secondary)",
              }}
            >
              Confirmed shoot bookings will appear here on the calendar.
            </p>
            <Link
              to="/admin/bookings"
              className="admin-action-btn"
              style={{
                display: "inline-block",
                padding: "6px 14px",
                fontSize: "11.5px",
                textDecoration: "none",
                background: "#151515",
                color: "#FFFFFF",
                borderColor: "#151515",
              }}
            >
              + Schedule Shoot
            </Link>
          </div>
        ) : (
          displayShoots.map((shoot) => (
            <div key={shoot.id} className="admin-shoot-card">
              <img
                src={shoot.thumbnail || "/images/dashboard/shoot-1.png"}
                alt={shoot.title}
                className="admin-shoot-thumb"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/images/dashboard/shoot-1.png";
                }}
              />
              <div className="admin-shoot-info">
                <h3 className="admin-shoot-title">{shoot.title}</h3>
                <span className="admin-shoot-client">
                  {shoot.client || shoot.clientName || "Studio Patron"} &middot; {shoot.location}
                </span>
                <span className="admin-shoot-time">
                  {shoot.dateFormatted || `${shoot.date} · ${shoot.time}`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

